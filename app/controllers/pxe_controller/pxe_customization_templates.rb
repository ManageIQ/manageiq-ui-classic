# Setting Accordion methods included in PxeController.rb
module PxeController::PxeCustomizationTemplates
  extend ActiveSupport::Concern

  def customization_template_delete
    assert_privileges("customization_template_delete")
    template_button_operation('destroy', 'Delete')
  end

  def template_list
    assert_privileges('customization_template_view')
    @lastaction = "template_list"
    @force_no_grid_xml = true
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, :list, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:ct_sortcol].nil? ? 0 : session[:ct_sortcol].to_i
    @sortdir = session[:ct_sortdir].nil? ? "ASC" : session[:ct_sortdir]
    pxe_img_id = x_node.split('-').last == "system" ? nil : x_node.split('-').last
    if pxe_img_id
      @view, @pages = get_view(CustomizationTemplate, :named_scope => [[:with_pxe_image_type_id, pxe_img_id]]) # Get the records (into a view) and the paginator
    else
      @view, @pages = get_view(CustomizationTemplate, :named_scope => [:with_system]) # Get the records (into a view) and the paginator
    end

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:ct_sortcol] = @sortcol
    session[:ct_sortdir] = @sortdir

    update_gtl_div('template_list') if params[:action] != "button" && pagination_or_gtl_request?
  end

  def customization_template_new
    assert_privileges("customization_template_new")
    @ct = CustomizationTemplate.new
    @in_a_form = true
    replace_right_cell(:nodetype => "ct-")
  end

  def customization_template_copy
    assert_privileges("customization_template_copy")
    @_params[:typ] = "copy"
    customization_template_edit
  end

  def customization_template_edit
    assert_privileges("customization_template_edit")
    unless params[:id]
      obj = find_checked_items
      @_params[:id] = obj[0] unless obj.empty?
    end
    @ct = @record = identify_record(params[:id], CustomizationTemplate) if params[:id]
    if params[:typ] && params[:typ] == "copy"
      @ct = CustomizationTemplate.new
    end
    @in_a_form = true
    replace_right_cell(:nodetype => "ct-#{params[:id]}")
  end

  private #######################

  # Get variables from edit form
  def template_get_form_vars
    @ct = @edit[:ct_id] ? CustomizationTemplate.find(@edit[:ct_id]) : CustomizationTemplate.new
    copy_params_if_present(@edit[:new], params, %i[name description typ])
    @edit[:new][:img_type] = params[:img_typ] if params[:img_typ]
    @edit[:new][:script] = params[:script_data] if params[:script_data]
    @edit[:new][:script] = "#{@edit[:new][:script]}..." if !params[:name] && !params[:description] && !params[:img_typ] && !params[:script_data] && !params[:typ]
  end

  def template_set_record_vars(ct)
    ct.name = @edit[:new][:name]
    ct.description = @edit[:new][:description]
    ct.type = @edit[:new][:typ]
    ct.pxe_image_type = PxeImageType.find_by(:id => @edit[:new][:img_type])
    ct.script = @edit[:new][:script]
  end

  # Common Schedule button handler routines
  def process_templates(templates, task)
    process_elements(templates, CustomizationTemplate, task)
  end

  # Common template button handler routines
  def template_button_operation(method, display_name)
    templates = []

    # Either a list or coming from a different controller (eg from host screen, go to its vms)
    if !params[:id]
      templates = find_checked_items
      if templates.empty?
        add_flash(_("No Customization Templates were selected to %{button}") % {:button => display_name}, :error)
      else
        process_templates(templates, method)
      end

      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => [:customization_templates])
    elsif params[:id].nil? || CustomizationTemplate.find(params[:id]).nil? # showing 1 vm
      add_flash(_("Customization Template no longer exists"), :error)
      template_list
      @refresh_partial = "layouts/gtl"
    else
      templates.push(params[:id])
      # need to set this for destroy method so active node can be set to image_type folder node after record is deleted
      ct = CustomizationTemplate.find(params[:id]) if method == 'destroy'
      process_templates(templates, method) unless templates.empty?
      # TODO: tells callers to go back to show_list because this record may be gone
      # Should be refactored into calling show_list right here
      if method == 'destroy'
        self.x_node = "xx-xx-#{ct.pxe_image_type_id}"
      end
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => [:customization_templates])
    end
    templates.count
  end

  def template_get_node_info(treenodeid)
    if treenodeid == "root"
      @folders = PxeImageType.all.sort
      @right_cell_text = _("All Customization Templates - System Image Types")
      @right_cell_div  = "template_list"
    else
      nodes = treenodeid.split("-")
      if nodes[0] == "ct"
        @right_cell_div = "template_details"
        @record = @ct = CustomizationTemplate.find(nodes[1])
        @right_cell_text = _("Customization Template \"%{name}\"") % {:name => @ct.name}
      else
        template_list
        pxe_img_id = x_node.split('-').last

        pxe_img_type = PxeImageType.find(pxe_img_id) if pxe_img_id != "system"
        @right_cell_text = if pxe_img_id == "system"
                             _("Examples (read only)")
                           else
                             _("Customization Templates for System Image Types \"%{name}\"") % {:name => pxe_img_type.name}
                           end
        @right_cell_div  = "template_list"
      end
    end
  end
end
