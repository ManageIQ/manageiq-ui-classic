# Setting Accordion methods included in OpsController.rb
module OpsController::Settings
  extend ActiveSupport::Concern

  include_concern 'AnalysisProfiles'
  include_concern 'CapAndU'
  include_concern 'Common'
  include_concern 'Schedules'
  include_concern 'AutomateSchedules'
  include_concern 'Tags'
  include_concern 'LabelTagMapping'
  include_concern 'Upload'
  include_concern 'Zones'
  include_concern 'RHN'
  include_concern 'HelpMenu'

  # Apply the good records from an uploaded import file
  def apply_imports
    if session[:imports]
      begin
        session[:imports].apply
      rescue => bang
        add_flash(_("Error during 'apply': %{error}") % {:error => bang}, :error)
        @sb[:show_button] = true
      else
        add_flash(_("Records were successfully imported"))
        @sb[:show_button] = false
        session[:imports] = @sb[:imports] = nil
      end
    else
      add_flash(_("Use the Choose file button to locate CSV file"), :error)
      @sb[:show_button] = true
    end
    flash_to_session
    redirect_to(:action => 'explorer', :no_refresh => true)
  end

  def forest_get_form_vars
    @edit = session[:edit]
    @ldap_info = {}
    @ldap_info[:mode] = params[:user_proxies_mode] if params[:user_proxies] && params[:user_proxies_mode]
    @ldap_info[:ldaphost] = params[:user_proxies][:ldaphost] if params[:user_proxies] && params[:user_proxies][:ldaphost]
    @ldap_info[:ldapport] = params[:user_proxies][:ldapport] if params[:user_proxies] && params[:user_proxies][:ldapport]
    @ldap_info[:basedn] = params[:user_proxies][:basedn] if params[:user_proxies] && params[:user_proxies][:basedn]
    @ldap_info[:bind_dn] = params[:user_proxies][:bind_dn] if params[:user_proxies] && params[:user_proxies][:bind_dn]
    @ldap_info[:bind_pwd] = params[:user_proxies][:bind_pwd] if params[:user_proxies] && params[:user_proxies][:bind_pwd]
    nil
  end

  def forest_form_field_changed
    @edit = session[:edit] # Need to reload @edit so it stays in the session
    port = params[:user_proxies_mode] == "ldap" ? "389" : "636"
    render :update do |page|
      page << javascript_prologue
      page << "$('#user_proxies_ldapport').val('#{port}');"
    end
  end

  # AJAX driven routine to select a classification entry
  def forest_select
    forest_get_form_vars
    if params[:ldaphost_id] == "new"
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page.replace("forest_entries_div", :partial => "ldap_forest_entries", :locals => {:entry => "new", :edit => true})
      end
      session[:entry] = "new"
    else
      entry = nil
      @edit[:new][:authentication][:user_proxies].each do |f|
        entry = f if f[:ldaphost] == params[:ldaphost_id]
      end
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page.replace("forest_entries_div", :partial => "ldap_forest_entries", :locals => {:entry => entry, :edit => true})
      end
      session[:entry] = entry
    end
  end

  # AJAX driven routine to delete a classification entry
  def forest_delete
    forest_get_form_vars
    idx = nil
    @edit[:new][:authentication][:user_proxies].each_with_index do |f, i|
      idx = i if f[:ldaphost] == params[:ldaphost_id]
    end
    @edit[:new][:authentication][:user_proxies].delete_at(idx) unless idx.nil?
    @changed = (@edit[:new] != @edit[:current])
    render :update do |page|
      page << javascript_prologue
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page << javascript_for_miq_button_visibility(@changed)
      page.replace("forest_entries_div", :partial => "ldap_forest_entries", :locals => {:entry => nil, :edit => false})
    end
  end

  # AJAX driven routine to add/update a classification entry
  def forest_accept
    forest_get_form_vars
    no_changes = true
    if @ldap_info[:ldaphost] == ""
      add_flash(_("LDAP Host is required"), :error)
      no_changes = false
    elsif @edit[:new][:authentication][:user_proxies].blank? || @edit[:new][:authentication][:user_proxies][0].blank? # if adding forest first time, delete a blank record
      @edit[:new][:authentication][:user_proxies].delete_at(0)
    else
      @edit[:new][:authentication][:user_proxies].each do |f|
        # check to make sure ldaphost already doesn't exist and ignore if existing record is being edited.
        next unless f[:ldaphost] == @ldap_info[:ldaphost] && session[:entry] == 'new'

        no_changes = false
        add_flash(_("LDAP Host should be unique"), :error)
        break
      end
    end
    if no_changes
      if session[:entry] == "new"
        @edit[:new][:authentication][:user_proxies].push(@ldap_info)
      else
        @edit[:new][:authentication][:user_proxies].each_with_index do |f, i|
          @edit[:new][:authentication][:user_proxies][i] = @ldap_info if f[:ldaphost] == session[:entry][:ldaphost]
        end
      end
    end
    @changed = (@edit[:new] != @edit[:current])
    render :update do |page|
      page << javascript_prologue
      page << javascript_for_miq_button_visibility(@changed)
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page.replace("forest_entries_div", :partial => "ldap_forest_entries", :locals => {:entry => nil, :edit => false}) if no_changes
    end
  end

  def region_edit
    settings_set_view_vars
    @right_cell_text = _("%{product} Region \"%{name}\"") %
                       {:name    => "#{MiqRegion.my_region.description} [#{MiqRegion.my_region.region}]",
                        :product => Vmdb::Appliance.PRODUCT_NAME}
    case params[:button]
    when "cancel"
      session[:edit] = @edit = nil
      replace_right_cell(:nodetype => "root")
    when "save"
      return unless load_edit("region_edit__#{params[:id]}", "replace_cell__explorer")

      if @edit[:new][:description].nil? || @edit[:new][:description] == ""
        add_flash(_("Region description is required"), :error)
      end
      unless @flash_array.nil?
        session[:changed] = @changed = true
        javascript_flash
        return
      end
      @edit[:region].description = @edit[:new][:description]
      begin
        @edit[:region].save!
      rescue
        @edit[:region].errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        @changed = true
        javascript_flash
      else
        add_flash(_("Region \"%{name}\" was saved") % {:name => @edit[:region].description})
        AuditEvent.success(build_saved_audit(@edit[:region], params[:button] == "edit"))
        @edit = session[:edit] = nil # clean out the saved info
        replace_right_cell(:nodetype => "root", :replace_trees => [:settings])
      end
    when "reset", nil # Reset or first time in
      region_set_form_vars
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "root")
    end
  end

  def region_form_field_changed
    return unless load_edit("region_edit__#{params[:id]}", "replace_cell__explorer")

    region_get_form_vars
    javascript_miq_button_visibility(@edit[:new] != @edit[:current])
  end

  private ############################

  def region_set_form_vars
    @edit = {}
    @edit[:region] = MiqRegion.my_region
    @edit[:key] = "region_edit__#{@edit[:region].id}"
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:new][:description] = @edit[:region].description
    @edit[:current] = copy_hash(@edit[:new])
  end

  def region_get_form_vars
    @edit[:new][:description] = params[:region_description] if params[:region_description]
  end

  def set_verify_status
    @edit[:default_verify_status] = (@edit[:new][:password] == @edit[:new][:verify])
  end
end
