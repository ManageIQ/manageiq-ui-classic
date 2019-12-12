module MiqAeCustomizationController::Dialogs
  extend ActiveSupport::Concern

  def dialog_delete
    assert_privileges("dialog_delete")
    dialog_button_operation('destroy', 'Delete')
  end

  def dialog_list
    @lastaction = "dialog_list"
    @gtl_type = "list"
    @explorer = true

    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end

    @sortcol = session[:dialog_sortcol].nil? ? 0 : session[:dialog_sortcol].to_i
    @sortdir = session[:dialog_sortdir].nil? ? "ASC" : session[:dialog_sortdir]

    # Get the records (into a view) and the paginator
    @view, @pages = get_view(Dialog)

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:dialog_sortcol] = @sortcol
    session[:dialog_sortdir] = @sortdir

    update_gtl_div('dialog_list') if pagination_or_gtl_request? && @show_list
  end

  # Add new dialog using the Dialog Editor
  def dialog_new_editor
    assert_privileges("dialog_new_editor")
    @record = Dialog.new
    javascript_redirect(:controller => 'miq_ae_customization', :action => 'editor', :id => @record.id)
  end

  # Edit dialog using the Dialog Editor
  def dialog_edit_editor
    assert_privileges("dialog_edit_editor")
    @record = find_records_with_rbac(Dialog, checked_or_params)
    javascript_redirect(:controller => 'miq_ae_customization',
                        :action     => 'editor',
                        :id         => Array.wrap(@record).first.id)
  end

  # Copy dialog using the Dialog Editor
  def dialog_copy_editor
    assert_privileges("dialog_copy_editor")
    record_to_copy = find_record_with_rbac(Dialog, checked_or_params)
    @record = Dialog.new
    javascript_redirect(:controller => 'miq_ae_customization',
                        :action     => 'editor',
                        :copy       => record_to_copy.id,
                        :id         => @record.id)
  end

  def change_tab
    get_node_info
    replace_right_cell(:nodetype => x_node)
  end

  ###########################################################################
  # Automation endpoint tree support methods
  #

  private

  # Common Schedule button handler routines
  def process_dialogs(dialogs, task)
    process_elements(dialogs, Dialog, task)
  end

  # Common VM button handler routines
  def dialog_button_operation(method, display_name)
    dialogs = []

    # Either a list or coming from a different controller (eg from host screen, go to its vms)
    if !params[:id]
      dialogs = find_checked_items
      if dialogs.empty?
        add_flash(_("No Dialogs were selected for %{task}") % {:task => display_name}, :error)
      else
        process_dialogs(dialogs, method)
      end
      get_node_info
      replace_right_cell(:nodetype => x_node, :replace_trees => [:dialogs])
    elsif params[:id].nil? || !Dialog.exists?(:id => params[:id])
      add_flash(_("Dialog no longer exists"), :error)
      dialog_list
      @refresh_partial = "layouts/gtl"
    else
      dialogs.push(params[:id])
      process_dialogs(dialogs, method) unless dialogs.empty?
      # TODO: tells callers to go back to show_list because this record may be gone
      # Should be refactored into calling show_list right here
      if method == 'destroy'
        self.x_node = "root"
      end
      get_node_info
      replace_right_cell(:nodetype => x_node, :replace_trees => [:dialogs])
    end
    dialogs.count
  end

  def dialog_get_node_info(treenodeid)
    if treenodeid == "root"
      dialog_list
      @right_cell_text = _("All Dialogs")
    else
      @sb[:active_tab] = "sample_tab" unless params[:tab_id] # reset active tab if not coming in from change_tab
      @record = Dialog.find(treenodeid.split('-').last)
      if @record.nil?
        @replace_tree = true # refresh tree and go back to root node if previously selected dialog record is deleted outside UI from vmdb
        self.x_node = "root"
        dialog_get_node_info(x_node)
      else
        @right_cell_text = _("Dialog \"%{name}\"") % {:name => @record.label}
      end
    end
    {:pages => @pages, :view => @view}
  end
end
