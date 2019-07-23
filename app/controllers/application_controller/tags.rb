module ApplicationController::Tags
  extend ActiveSupport::Concern

  # Edit user, group or tenant tags
  def tagging_edit(db = nil, assert = true)
    assert_privileges("#{@display && @display != "main" ? @display.singularize : controller_for_common_methods}_tag") if assert
    @explorer = true if request.xml_http_request? # Ajax request means in explorer

    @tagging = session[:tag_db] = params[:db] ? params[:db] : db if params[:db] || db
    @tagging ||= session[:tag_db] if session[:tag_db]
    case params[:button]
    when "cancel"
      tagging_edit_tags_cancel
    when "save", "add"
      tagging_edit_tags_save
    when "reset", nil # Reset or first time in
      tagging_edit_tags_reset
    end
  end

  def service_tag
    tagging_edit('Service')
  end

  def container_tag
    tagging_edit('Container')
  end

  def automation_manager_provider_tag
    tagging_edit('ManageIQ::Providers::AnsibleTower::AutomationManager')
  end

  def configuration_manager_provider_tag
    tagging_edit('ManageIQ::Providers::ConfigurationManager')
  end

  alias_method :image_tag, :tagging_edit
  alias_method :instance_tag, :tagging_edit
  alias_method :vm_tag, :tagging_edit
  alias_method :miq_template_tag, :tagging_edit
  alias_method :storage_tag, :tagging_edit
  alias_method :infra_networking_tag, :tagging_edit

  # Handle tag edit field changes
  def tag_edit_form_field_changed
    id = params[:id]
    return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}", "replace_cell__explorer")
    tag_set_vars_from_params
    tag_edit_build_entries_pulldown
    render :update do |page|
      page << javascript_prologue
      changed = (@edit[:new] != @edit[:current])
      if changed != session[:changed]
        session[:changed] = changed
        page << javascript_for_miq_button_visibility(changed)
      end
      page.replace("cat_tags_div", :partial => "layouts/tag_edit_cat_tags")
      page.replace("assignments_div", :partial => "layouts/tag_edit_assignments") unless params[:tag_cat]
      if params[:tag_add]
        page << jquery_pulsate_element("#{j_str(params[:tag_add])}_tr")
      end
      page << set_spinner_off if params[:tag_cat] || params[:tag_add]
    end
  end

  private ############################

  def tag_set_vars_from_params
    if params[:tag_cat]
      cat = Classification.find_by(:id => params[:tag_cat])
      @edit[:cat] = {
        :id          => cat.id,
        :name        => cat.name,
        :description => cat.description,
        :entries     => cat.entries.map { |e| { :id => e.id, :description => e.description } }
      }
      tag_edit_build_entries_pulldown
    elsif params[:tag_add]
      tad_add_assignments
    elsif params[:tag_remove]
      @edit[:new][:assignments].delete(params[:tag_remove].to_i)
    end
    @edit[:new][:assignments].sort!
    @assignments ||= Classification.find(@edit.fetch_path(:new, :assignments))
  end

  def tad_add_assignments
    @edit[:new][:assignments].push(params[:tag_add].to_i)
    @assignments ||= Classification.find(@edit.fetch_path(:new, :assignments))
    @assignments.each_with_index do |a, a_idx|
      # skip when same category, single value category, different tag
      next unless delete_from_assignments?(a)
      @edit[:new][:assignments].delete(a.id) # Remove prev tag from new
      @assignments.delete_at(a_idx) # Remove prev tag from display
    end
  end

  def delete_from_assignments?(value)
    value.parent.name == @edit[:cat][:name] && value.parent.single_value && value.id != params[:tag_add].to_i
  end

  def get_tag_items
    record_ids = find_records_with_rbac(
      (@tagging.instance_of? String) ? @tagging.safe_constantize : @tagging,
      checked_or_params
    ).map(&:id)
    session[:tag_items] = record_ids
    session[:assigned_filters] = assigned_filters
  end

  def tagging_edit_tags_reset
    get_tag_items if @explorer
    @object_ids = session[:tag_items]
    @sb[:rec_id] = params[:id] ? params[:id] : session[:tag_items][0]
    @tagging = session[:tag_db].to_s
    if params[:button] == "reset"
      id = params[:id] if params[:id]
      return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}")
      @object_ids = @edit[:object_ids]
    end
    @in_a_form = true
    tagging_tags_set_form_vars
    @display   = nil
    session[:changed] = false
    add_flash(_("All changes have been reset"), :warning) if params[:button] == "reset"
    @title = _('Tag Assignment')
    if tagging_explorer_controller?
      @refresh_partial = "layouts/tagging"
      replace_right_cell(:action => @sb[:action]) if params[:button]
    else
      render "shared/views/tagging_edit"
    end
  end

  # Set form vars for tag editor
  def tagging_tags_set_form_vars
    @edit = {}
    @edit[:new] = {}
    @edit[:key] = "#{@tagging}_edit_tags__#{@sb[:rec_id]}"
    @edit[:object_ids] = @object_ids
    @edit[:tagging] = @tagging
    tag_edit_build_screen
    build_targets_hash(@tagitems)

    @edit[:current] = copy_hash(@edit[:new])
  end

  def tagging_edit_tags_cancel
    id = params[:id]
    return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}")
    add_flash(_("Tag Edit was cancelled by the user"))
    session[:tag_items] = nil                                 # reset tag_items in session
    if tagging_explorer_controller?
      @edit = nil # clean out the saved info
      @sb[:action] = nil
      replace_right_cell
    else
      @edit = nil                               # clean out the saved info
      session[:flash_msgs] = @flash_array.dup   # Put msg in session for next transaction to display
      javascript_redirect previous_breadcrumb_url
    end
  end

  def tagging_edit_tags_save
    id = params[:id]
    return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}")

    tagging_save_tags

    if tagging_explorer_controller?
      @edit = nil # clean out the saved info
      @sb[:action] = nil
      replace_right_cell
    else
      @edit = nil
      flash_to_session
      javascript_redirect previous_breadcrumb_url
    end
  end

  def tagging_edit_tags_save_and_replace_right_cell
    id = params[:id]
    return unless load_edit("#{session[:tag_db]}_edit_tags__#{id}", "replace_cell__explorer")

    tagging_save_tags

    get_node_info(x_node)
    @edit = nil
    replace_right_cell(:nodetype => @nodetype)
  end

  # Add/remove tags in a single transaction
  def tagging_save_tags
    Classification.bulk_reassignment({:model      => @edit[:tagging],
                                      :object_ids => @edit[:object_ids],
                                      :add_ids    => @edit[:new][:assignments] - @edit[:current][:assignments],
                                      :delete_ids => @edit[:current][:assignments] - @edit[:new][:assignments]
                                    })
  rescue => bang
    add_flash(_("Error during 'Save Tags': %{error_message}") % {:error_message => bang.message}, :error)
  else
    add_flash(_("Tag edits were successfully saved"))
  end


  # Build the @edit elements for the tag edit screen
  def tag_edit_build_screen
    @showlinks = true

    cats = Classification.categories.select(&:show).sort_by { |t| t.description.try(:downcase) } # Get the categories, sort by description
    @categories = {}    # Classifications array for first chooser
    cats.delete_if { |c| c.read_only? || c.entries.length == 0 }  # Remove categories that are read only or have no entries
    cats.each do |c|
      if c.single_value?
        @categories[c.description + " *"] = c.id
      else
        @categories[c.description] = c.id
      end
    end

    if ["User", "MiqGroup", "Tenant"].include?(@tagging)
      session[:assigned_filters] = []  # No view filters used for user/groups/tenants, set as empty for later methods
    else
      cats.each do |cat_key|  # not needed for user/group tags since they are not filtered for viewing
        if session[:assigned_filters].include?(cat_key.name.downcase)
          cats.delete(cat_key)
        end
      end
    end

    # Set to first category, if not already set
    cat = cats.first
    @edit[:cat] ||= {
      :id          => cat.id,
      :name        => cat.name,
      :description => cat.description,
      :entries     => cat.entries.map { |e| { :id => e.id, :description => e.description } }
    }

    unless @object_ids.blank?
      @tagitems = @tagging.constantize.where(:id => @object_ids).sort_by { |t| t.name.try(:downcase).to_s }
    end

    @view = get_db_view(@tagging, :clickable => false) # Instantiate the MIQ Report view object
    @view.table = ReportFormatter::Converter.records2table(@tagitems, @view.cols + ['id'])

    # Start with the first items assignments
    @edit[:new][:assignments] =
      Classification.find_assigned_entries(@tagitems[0]).collect { |e| e.id unless e.parent.read_only? }
    @tagitems.each do |item|
      itemassign = Classification.find_assigned_entries(item).collect(&:id) # Get each items assignments
      @edit[:new][:assignments].delete_if { |a| !itemassign.include?(a) } # Remove any assignments that are not in the new items assignments
      break if @edit[:new][:assignments].length == 0                      # Stop looking if no assignments are left
    end
    @edit[:new][:assignments].sort!
    @assignments = Classification.find(@edit.fetch_path(:new, :assignments))
    tag_edit_build_entries_pulldown
  end

  # Build the second pulldown containing the entries for the selected category
  def tag_edit_build_entries_pulldown
    @entries = {}                   # Create new entries hash (2nd pulldown)
    @edit[:cat][:entries].each do |e|       # Get all of the entries for the current category
      @entries[e[:description]] = e[:id]      # Add it to the hash
    end

    assignments = Classification.find(@edit.fetch_path(:new, :assignments))
    assignments.each do |a|                               # Look thru the assignments
      if a.parent.description == @edit[:cat][:description]  # If they match the category
        @entries.delete(a.description)                    # Remove them from the selection list
      end
    end
  end

  # Tag selected db records
  def tag(db = nil)
    assert_privileges(params[:pressed])
    @tagging = session[:tag_db] = db        # Remember the DB
    get_tag_items
    drop_breadcrumb(:name => _("Tag Assignment"), :url => "/#{session[:controller]}/tagging_edit")
    javascript_redirect :action => 'tagging_edit',
                         :id     => params[:id],
                         :db     => db,
                         :escape => false
  end

  # Getting my company tags and my tags to display on summary screen
  def get_tagdata(rec)
    session[:assigned_filters] = {}
    filters = Classification.find_assigned_entries(rec)
    filters.each do |a|
      path    = [:assigned_filters, a.parent.description]
      array   = session.fetch_path(path)
      array ||= session.store_path(path, [])
      array << a.description
    end
    session[:mytags] = rec.tagged_with(:cat => session[:userid])    # Start with the first items tags
  end

  def locals_for_tagging
    {:action_url   => 'tagging',
     :multi_record => true,
     :record_id    => @sb[:rec_id] || @edit[:object_ids] && @edit[:object_ids][0]
    }
  end

  def update_tagging_partials(presenter)
    presenter.update(:main_div, r[:partial => 'layouts/tagging',
                                  :locals  => locals_for_tagging])
    presenter.update(:form_buttons_div, r[:partial => 'layouts/x_edit_buttons',
                                          :locals  => locals_for_tagging])
  end
end
