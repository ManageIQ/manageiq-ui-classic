module OpsController::Settings::Zones
  extend ActiveSupport::Concern

  def zone_edit
    case params[:button]
    when "cancel"
      @edit = nil
      @zone = Zone.find(session[:edit][:zone_id]) if session[:edit] && session[:edit][:zone_id]
      if @zone.try(:id)
        add_flash(_("Edit of Zone \"%{name}\" was cancelled by the user") % {:name => @zone.name})
      else
        add_flash(_("Add of new Zone was cancelled by the user"))
      end
      get_node_info(x_node)
      replace_right_cell(:nodetype => @nodetype)
    when "save", "add"
      assert_privileges("zone_#{params[:id] ? "edit" : "new"}")
      id = params[:id] || "new"
      return unless load_edit("zone_edit__#{id}", "replace_cell__explorer")

      @zone = @edit[:zone_id] ? Zone.find(@edit[:zone_id]) : Zone.new

      unless @edit[:new][:name]
        add_flash(_("Name can't be blank"), :error)
      end
      unless @edit[:new][:description]
        add_flash(_("Description can't be blank"), :error)
      end

      # This is needed for cases when more than one required field is missing or is not correct, to prevent rendering same flash messages
      if @flash_array
        javascript_flash(:spinner_off => true)
        return
      end

      zone_set_record_vars(@zone)
      if valid_record?(@zone) && @zone.save
        AuditEvent.success(build_created_audit(@zone, @edit))
        if params[:button] == "save"
          add_flash(_("Zone \"%{name}\" was saved") % {:name => params[:name]})
        else
          add_flash(_("Zone \"%{name}\" was added") % {:name => params[:name]})
        end
        @edit = nil
        self.x_node = params[:button] == "save" ? "z-#{params[:id]}" : "xx-z"
        get_node_info(x_node)
        replace_right_cell(:nodetype => "root", :replace_trees => %i[settings diagnostics])
        
      else
        add_flash(_("Zone \"%{name}\" was added") % {:name => params[:name]})
      end
      replace_right_cell(:nodetype => "root", :replace_trees => %i[settings diagnostics])
    when "reset", nil # Reset or first time in
      zone_build_edit_screen
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "ze")
    end
  end

  # AJAX driven routine to delete a zone
  def zone_delete
    assert_privileges("zone_delete")
    zone = Zone.find(params[:id])
    zonename = zone.name
    begin
      zone.destroy
    rescue => bang
      add_flash(bang.to_s, :error)
      zone.errors.each { |field, msg| add_flash("#{field.to_s.capitalize} #{msg}", :error) }
      self.x_node = "z-#{zone.id}"
      get_node_info(x_node)
    else
      add_flash(_("Zone \"%{name}\": Delete successful") % {:name => zonename})
      @sb[:active_tab] = "settings_list"
      self.x_node = "xx-z"
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => %i[settings diagnostics])
    end
  end

  # AJAX driven routine to check for changes in ANY field on the user form
  def zone_field_changed
    return unless load_edit("zone_edit__#{params[:id]}", "replace_cell__explorer")

    zone_get_form_vars
    session[:changed] = @changed = @edit[:new] != @edit[:current]
    render :update do |page|
      page << javascript_prologue
      if @refresh_div
        page.replace(@refresh_div, :partial => @refresh_partial,
                                   :locals  => {:type => "zones", :action_url => 'zone_field_changed'})
      end
      page << javascript_for_miq_button_visibility(@changed)
    end
  end

  private

  # Set user record variables to new values
  def zone_set_record_vars(zone, mode = nil)
    zone.name = @edit[:new][:name]
    zone.description = @edit[:new][:description]
    zone.settings ||= {}
    zone.settings[:proxy_server_ip] = @edit[:new][:proxy_server_ip]
    zone.settings[:concurrent_vm_scans] = @edit[:new][:concurrent_vm_scans]

    zone.update_authentication({:windows_domain => {:userid => @edit[:new][:userid], :password => @edit[:new][:password]}}, {:save => (mode != :validate)})
  end

  # Validate the zone record fields
  def valid_record?(zone)
    valid = true
    @edit[:errors] = []
    if zone.authentication_password.present? && zone.authentication_userid.blank?
      @edit[:errors].push(_("Username must be entered if Password is entered"))
      valid = false
    end
    if @edit[:new][:password] != @edit[:new][:verify]
      @edit[:errors].push(_("Password and Verify Password fields do not match"))
      valid = false
    end
    valid
  end

  # Get variables from zone edit form
  def zone_get_form_vars
    @zone = @edit[:zone_id] ? Zone.find(@edit[:zone_id]) : Zone.new

    copy_params_if_present(@edit[:new], params, %i[name description proxy_server_ip userid password verify])
    @edit[:new][:concurrent_vm_scans] = params[:max_scans].to_i if params[:max_scans]

    set_verify_status
  end

  def zone_build_edit_screen
    @zone = params[:id] ? Zone.find(params[:id]) : Zone.new # Get existing or new record
    zone_set_form_vars
    @in_a_form = true
    session[:changed] = false
  end

  # Set form variables for user add/edit
  def zone_set_form_vars
    @edit = {}
    @edit[:zone_id] = @zone.id
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "zone_edit__#{@zone.id || "new"}"

    @edit[:new][:name] = @zone.name
    @edit[:new][:description] = @zone.description
    @edit[:new][:proxy_server_ip] = @zone.settings ? @zone.settings[:proxy_server_ip] : nil
    @edit[:new][:concurrent_vm_scans] = @zone.settings ? @zone.settings[:concurrent_vm_scans].to_i : 0

    @edit[:new][:userid] = @zone.authentication_userid(:windows_domain)
    @edit[:new][:password] = @zone.authentication_password(:windows_domain)
    @edit[:new][:verify] = @zone.authentication_password(:windows_domain)

    session[:verify_ems_status] = nil
    set_verify_status

    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end
end
