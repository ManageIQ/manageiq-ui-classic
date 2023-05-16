# Setting Accordion methods included in OpsController.rb
module PxeController::IsoDatastores
  extend ActiveSupport::Concern

  # Common VM button handler routines
  def iso_datastore_button_operation(method, display_name)
    isds = []

    # Either a list or coming from a different controller (eg from host screen, go to its vms)
    if !params[:id]
      isds = find_checked_items
      if isds.empty?
        add_flash(_("No ISO Datastores were selected to %{button}") % {:button => display_name},
                  :error)
      else
        process_iso_datastores(isds, method, display_name)
      end

      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => [:iso_datastores])
    elsif params[:id].nil? || Storage.supporting(:iso_datastore).find { |storage| storage.id == params[:id].to_i }.nil? # showing 1 vm
      add_flash(_("ISO Datastore no longer exists"), :error)
      iso_datastore_list
      @refresh_partial = "layouts/x_gtl"
    else
      isds.push(params[:id])
      process_iso_datastores(isds, method, display_name) unless isds.empty?
      # TODO: tells callers to go back to show_list because this iso_datastore may be gone
      # Should be refactored into calling show_list right here
      if method == 'destroy'
        self.x_node = "root"
        @single_delete = true unless flash_errors?
      end
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => [:iso_datastores])
    end
    isds.count
  end

  def iso_datastore_delete
    assert_privileges("iso_datastore_delete")
    iso_datastore_button_operation('destroy', 'Delete')
  end

  def iso_datastore_list
    assert_privileges('iso_datastore_view')
    @lastaction = "iso_datastore_list"
    @force_no_grid_xml = true
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, :list, @items_per_page)          # Set the per page setting for this gtl type
    end
    @sortcol = session[:iso_sortcol].nil? ? 0 : session[:iso_sortcol].to_i
    @sortdir = session[:iso_sortdir].nil? ? "ASC" : session[:iso_sortdir]

    @view, @pages = get_view(Storage) # Get the records (into a view) and the paginator

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:iso_sortcol] = @sortcol
    session[:iso_sortdir] = @sortdir

    if @show_list && (params[:action] != "button" && pagination_or_gtl_request?)
      update_gtl_div('iso_datastore_list')
    end
  end

  def iso_image_edit
    assert_privileges("iso_image_edit")
    @img = IsoImage.find(params[:id])
    @in_a_form = true
    replace_right_cell(:nodetype => "isi")
  end

  private #######################

  # Get variables from edit form
  def iso_img_get_form_vars
    @img = @edit[:img]
    @edit[:new][:img_type] = params[:image_typ] if params[:image_typ]
    @edit[:new][:default_for_windows] = params[:default_for_windows] == "1" if params[:default_for_windows]
  end

  # Get variables from edit form
  def iso_datastore_get_form_vars
    @isd = @edit[:isd]
    @edit[:new][:ems_id] = params[:ems_id] if params[:ems_id]
  end

  # Set form variables for edit
  def iso_datastore_set_form_vars
    @edit = {}
    @edit[:emses] = ExtManagementSystem.order(:name).supporting(:create_iso_datastore)
  end

  # Common Schedule button handler routines
  def process_iso_datastores(elements, task, display_name)
    process_elements(elements, Storage, task, display_name, "ems_id")
  end

  def iso_datastore_get_node_info(treenodeid)
    if treenodeid == "root"
      iso_datastore_list
      @right_cell_text = _("All ISO Datastores")
      @right_cell_div  = "iso_datastore_list"
    else
      @right_cell_div = "iso_datastore_details"
      nodes = treenodeid.split("-")
      if nodes[0] == "ds" && nodes.length == 2
        # on iso_datastore node OR folder node is selected
        @record = @isd = Storage.supporting(:iso_datastore).find { |storage| storage.id == nodes.last.to_i }
        @right_cell_text = _("ISO Datastore \"%{name}\"") % {:name => @isd.name} unless @isd.nil?
      elsif nodes[0] == "isi"
        @record = @img = IsoImage.find(nodes.last)
        @right_cell_text = _("ISO Image \"%{name}\"") % {:name => @img.name}
      end
    end
  end
end
