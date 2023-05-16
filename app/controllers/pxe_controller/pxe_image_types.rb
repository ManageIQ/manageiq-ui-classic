# Setting Accordion methods included in OpsController.rb
module PxeController::PxeImageTypes
  extend ActiveSupport::Concern

  def pxe_image_type_new
    assert_privileges("pxe_image_type_new")
    @pxe_image_type = PxeImageType.new
    @in_a_form = true
    replace_right_cell(:nodetype => "pit")
  end

  def pxe_image_type_edit
    assert_privileges("pxe_image_type_edit")
    @pxe_image_type = find_record_with_rbac(PxeImageType, @_params[:id] = checked_or_params.first)
    @in_a_form = true
    replace_right_cell(:nodetype => "pit")
  end

  # Common VM button handler routines
  def pxe_image_type_button_operation(method)
    pxes = find_records_with_rbac(PxeImageType, checked_or_params)
    process_pxe_image_type(pxes.ids, method)
    if params[:id] && method == 'destroy'
      self.x_node = "root"
      @single_delete = true unless flash_errors?
    end
    get_node_info(x_node)
    replace_right_cell(:nodetype      => params[:id] ? x_node : "root",
                       :replace_trees => %i[pxe_image_types customization_templates])
    pxes.count
  end

  def pxe_image_type_delete
    assert_privileges("pxe_image_type_delete")
    pxe_image_type_button_operation('destroy')
  end

  def pxe_image_type_list
    assert_privileges('pxe_image_type_view')
    @lastaction = "pxe_image_type_list"
    @force_no_grid_xml = true
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, :list, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:pxe_image_type_sortcol].nil? ? 0 : session[:pxe_image_type_sortcol].to_i
    @sortdir = session[:pxe_image_type_sortdir].nil? ? "ASC" : session[:pxe_image_type_sortdir]

    @view, @pages = get_view(PxeImageType) # Get the records (into a view) and the paginator

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:pxe_image_type_sortcol] = @sortcol
    session[:pxe_image_type_sortdir] = @sortdir

    update_gtl_div('pxe_image_type_list') if params[:action] != "button" && pagination_or_gtl_request?
  end

  private

  def pxe_image_type_validate_fields
    if @edit[:new][:name].blank?
      add_flash(_("Name is required"), :error)
    end
  end

  def pxe_image_type_set_record_vars(pxe)
    pxe.name = @edit[:new][:name]
    pxe.provision_type = @edit[:new][:provision_type]
  end

  # Get variables from edit form
  def pxe_image_type_get_form_vars
    @pxe_image_type = @edit[:pxe_id] ? PxeImageType.find(@edit[:pxe_id]) : PxeImageType.new
    copy_params_if_present(@edit[:new], params, %i[name provision_type])
  end

  # Common Schedule button handler routines
  def process_pxe_image_type(pxes, task)
    process_elements(pxes, PxeImageType, task)
  end

  def pxe_image_type_get_node_info(treenodeid)
    if treenodeid == "root"
      pxe_image_type_list
      @right_cell_text = _("All System Image Types")
      @right_cell_div  = "pxe_image_type_list"
    else
      @right_cell_div = "pxe_image_type_details"
      nodes = treenodeid.split("-")
      @record = @pxe_image_type = PxeImageType.find(nodes.last)
      @right_cell_text = _("System Image Types \"%{name}\"") % {:name => @pxe_image_type.name}
    end
  end
end
