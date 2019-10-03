module MiqAeCustomizationController::OldDialogs
  extend ActiveSupport::Concern

  # Get variables from edit form
  def old_dialogs_get_form_vars
    @dialog = @edit[:dialog]
    @edit[:new][:name] = CGI.unescape(params[:name]) if params[:name]
    @edit[:new][:description] = CGI.unescape(params[:description]) if params[:description]
    @edit[:new][:dialog_type] = CGI.unescape(params[:dialog_type]) if params[:dialog_type]
    @edit[:new][:content] = params[:content_data] if params[:content_data]
    @edit[:new][:content] = @edit[:new][:content] + "..." if !params[:name] && !params[:description] && !params[:dialog_type] && !params[:content_data]
  end

  # Set form variables for edit
  def old_dialogs_set_form_vars
    @edit = {}
    @edit[:dialog] = @dialog

    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "dialog_edit__#{@dialog.id || "new"}"

    @edit[:new][:name] = @dialog.name
    @edit[:new][:description] = @dialog.description
    @edit[:new][:dialog_type] = if @dialog.dialog_type
                                  @dialog.dialog_type
                                else
                                  # if new customization dialogs, check if add button was pressed form folder level, to auto select image type
                                  x_node == "root" ? @dialog.dialog_type : x_node.split('_')[1]
                                end

    @edit[:new][:content] = @dialog.content.to_yaml
    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  def old_dialogs_set_record_vars(dialog)
    dialog.name = @edit[:new][:name]
    dialog.description = @edit[:new][:description]
    dialog.dialog_type = @edit[:new][:dialog_type]
    dialog.content = YAML.load(@edit[:new][:content])
  end

  # Common Schedule button handler routines
  def process_old_dialogs(dialogs, task)
    process_elements(dialogs, MiqDialog, task)
  end

  # Common VM button handler routines
  def old_dialogs_button_operation(method, display_name)
    dialogs = []

    # Either a list or coming from a different controller (eg from host screen, go to its vms)
    if !params[:id]
      dialogs = find_checked_items
      if dialogs.empty?
        add_flash(_("No Dialogs were selected for %{task}") % {:task => display_name}, :error)
      else
        to_delete = []
        dialogs.each do |d|
          dialog = MiqDialog.find(d)
          if dialog.default == true
            to_delete.push(d)
            add_flash(_("Default Dialog \"%{name}\" cannot be deleted") % {:name => dialog.name}, :error)
          end
        end
        # deleting elements in temporary array, had to create temp array to hold id's to be deleted from dialogs array, .each gets confused if i deleted them in above loop
        to_delete.each do |a|
          dialogs.delete(a)
        end
        process_old_dialogs(dialogs, method)
      end

      get_node_info
      replace_right_cell(:nodetype => x_node, :replace_trees => [:old_dialogs])
    elsif params[:id].nil? || !MiqDialog.exists?(params[:id])
      add_flash(_("Dialog no longer exists"), :error)
      old_dialogs_list
      @refresh_partial = "layouts/gtl"
    else
      dialogs.push(params[:id])
      # need to set this for destroy method so active node can be set to image_type folder node after record is deleted
      dialog = MiqDialog.find(params[:id]) if method == 'destroy'
      if dialog.default
        add_flash(_("Default Dialog \"%{name}\" cannot be deleted") % {:name => dialog.name}, :error)
      else
        process_old_dialogs(dialogs, method) unless dialogs.empty?
      end

      self.x_node = "xx-MiqDialog_#{dialog.dialog_type}" if method == 'destroy' && !flash_errors?
      get_node_info
      replace_right_cell(:nodetype => x_node, :replace_trees => [:old_dialogs])
    end
    dialogs.count
  end

  def old_dialogs_get_node_info(treenodeid)
    if treenodeid == "root"
      old_dialogs_list
      @right_cell_text = _("All Dialogs")
      @right_cell_div  = "old_dialogs_list"
    else
      nodes = treenodeid.split("_")
      if nodes[0].split('-').first == "odg"
        @right_cell_div = "dialogs_details"
        @record = @dialog = MiqDialog.find(nodes[0].split('-').last)
        @right_cell_text = _("Dialogs \"%{name}\"") % {:name => @dialog.description}
      else
        old_dialogs_list
        img_typ = ""
        MiqDialog::DIALOG_TYPES.each do |typ|
          img_typ = _(typ[0]) if typ[1] == nodes[1]
        end
        @right_cell_text = _("%{typ} Dialogs") % {:typ => img_typ}
        @right_cell_div  = "old_dialogs_list"
      end
    end
    {:pages => @pages, :view => @view}
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def old_dialogs_form_field_changed
    return unless load_edit("dialog_edit__#{params[:id]}", "replace_cell__explorer")
    old_dialogs_get_form_vars
    render :update do |page|
      page << javascript_prologue
      changed = (@edit[:new] != @edit[:current])
      page << javascript_for_miq_button_visibility(changed)
    end
  end

  def old_dialogs_delete
    assert_privileges("old_dialogs_delete")
    old_dialogs_button_operation('destroy', 'Delete')
  end

  def old_dialogs_list
    @lastaction = "old_dialogs_list"
    @force_no_grid_xml   = true
    @gtl_type            = "list"
    @dialog = nil
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:dialog_sortcol].nil? ? 0 : session[:dialog_sortcol].to_i
    @sortdir = session[:dialog_sortdir].nil? ? "ASC" : session[:dialog_sortdir]

    if x_node == "root"
      @view, @pages = get_view(MiqDialog) # Get the records (into a view) and the paginator
    else
      @view, @pages = get_view(MiqDialog, :named_scope => [[:with_dialog_type, x_node.split('_').last]]) # Get the records (into a view) and the paginator
    end

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:dialog_sortcol] = @sortcol
    session[:dialog_sortdir] = @sortdir
  end

  def old_dialogs_new
    assert_privileges("old_dialogs_new")
    @dialog = MiqDialog.new
    old_dialogs_set_form_vars
    @in_a_form = true
    replace_right_cell(:nodetype => "odg-")
  end

  def old_dialogs_copy
    assert_privileges("old_dialogs_copy")
    @_params[:typ] = "copy"
    old_dialogs_edit
  end

  def old_dialogs_edit
    assert_privileges("old_dialogs_edit")

    # copy called on checkbox-checked item
    unless params[:id]
      obj = find_checked_items
      @_params[:id] = obj[0]
    end

    if params[:typ] == "copy"
      dialog = MiqDialog.find(params[:id])
      @dialog = MiqDialog.new
      @dialog.name = "Copy of " + dialog.name
      @dialog.description = dialog.description
      @dialog.dialog_type = dialog.dialog_type
      @dialog.content = dialog.content
      session[:changed] = true
    else
      @dialog = @record = identify_record(params[:id], MiqDialog) if params[:id]
      session[:changed] = false
    end
    if @dialog.default == true
      add_flash(_("Default Dialog \"%{name}\" can not be edited") % {:name => @dialog.name}, :error)
      get_node_info
      replace_right_cell(:nodetype => x_node)
      return
    end
    old_dialogs_set_form_vars
    @in_a_form = true
    replace_right_cell(:nodetype => "odg-#{params[:id]}")
  end

  def old_dialogs_update
    id = params[:id] ? params[:id] : "new"
    return unless load_edit("dialog_edit__#{id}", "replace_cell__explorer")
    old_dialogs_update_create
  end

  private

  def old_dialogs_update_create
    old_dialogs_get_form_vars
    case params[:button]
    when "cancel"
      @edit = session[:edit] = nil # clean out the saved info
      if !@dialog || @dialog.id.blank?
        add_flash(_("Add of new Dialog was cancelled by the user"))
      else
        add_flash(_("Edit of Dialog \"%{name}\" was cancelled by the user") % {:name => get_record_display_name(@dialog)})
      end
      get_node_info
      replace_right_cell(:nodetype => x_node)
    when "add", "save"
      # dialog = find_record_with_rbac(MiqDialog, params[:id])
      dialog = @dialog.id.blank? ? MiqDialog.new : MiqDialog.find(@dialog.id) # Get new or existing record
      if @edit[:new][:name].blank?
        add_flash(_("Name is required"), :error)
      end
      if @edit[:new][:dialog_type].blank?
        add_flash(_("Dialog Type must be selected"), :error)
      end
      unless @flash_array
        begin
          YAML.parse(@edit[:new][:content])
        rescue YAML::SyntaxError => ex
          add_flash(_("Syntax error in YAML file: %{error_message}") % {:error_message => ex.message}, :error)
        end
      end
      if @flash_array
        javascript_flash
        return
      end

      old_dialogs_set_record_vars(dialog)
      begin
        dialog.save!
      rescue StandardError
        dialog.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        @changed = true
        javascript_flash
      else
        if params[:button] == "add"
          add_flash(_("Dialog \"%{name}\" was added") % {:name => get_record_display_name(dialog)})
        else
          add_flash(_("Dialog \"%{name}\" was saved") % {:name => get_record_display_name(dialog)})
        end
        AuditEvent.success(build_saved_audit(dialog, @edit))
        @edit = session[:edit] = nil # clean out the saved info
        # if editing from list view then change active_node to be same as updated image_type folder node
        if x_node.split('-')[0] == "xx"
          self.x_node = "xx-MiqDialog_#{dialog.dialog_type}"
        elsif params[:button] == "add"
          d = MiqDialog.find_by(:name => dialog.name, :dialog_type => dialog.dialog_type)
          self.x_node = "odg-#{d.id}"
        end
        get_node_info
        replace_right_cell(:nodetype => x_node, :replace_trees => [:old_dialogs])
      end
    when "reset", nil # Reset or first time in
      add_flash(_("All changes have been reset"), :warning)
      @in_a_form = true
      old_dialogs_edit
    end
  end
end
