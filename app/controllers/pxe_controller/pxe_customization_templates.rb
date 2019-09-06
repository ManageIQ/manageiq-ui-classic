# Setting Accordion methods included in PxeController.rb
module PxeController::PxeCustomizationTemplates
  extend ActiveSupport::Concern

  # AJAX driven routine to check for changes in ANY field on the form
  def template_form_field_changed
    return unless load_edit("ct_edit__#{params[:id]}", "replace_cell__explorer")
    @prev_typ = @edit[:new][:typ]
    template_get_form_vars
    render :update do |page|
      page << javascript_prologue
      changed = (@edit[:new] != @edit[:current])
      if params[:typ] && @prev_typ != @edit[:new][:typ]
        @edit[:new][:script] = ""
        page.replace_html("script_div", :partial => "template_script_data")
      end
      page << javascript_for_miq_button_visibility(changed)
    end
  end

  def customization_template_delete
    assert_privileges("customization_template_delete")
    template_button_operation('destroy', 'Delete')
  end

  def template_list
    @lastaction = "template_list"
    @force_no_grid_xml   = true
    @gtl_type            = "list"
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
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
    template_set_form_vars
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
      options = {
        :name        => "Copy of #{@record.name}",
        :description => @record.description,
        :script      => @record.script,
        :type        => @record.type
      }
      options[:pxe_image_type_id] = @record.pxe_image_type_id.to_s if @record.pxe_image_type_id
      @ct = CustomizationTemplate.new(options)
    end
    template_set_form_vars
    @in_a_form = true
    session[:changed] = false
    replace_right_cell(:nodetype => "ct-#{params[:id]}")
  end

  def template_create_update
    id = params[:id] || "new"
    return unless load_edit("ct_edit__#{id}")
    template_get_form_vars
    if params[:button] == "cancel"
      @edit = session[:edit] = nil # clean out the saved info
      if @ct.id
        add_flash(_("Edit of Customization Template \"%{name}\" was cancelled by the user") % {:name => get_record_display_name(@ct)})
      else
        add_flash(_("Add of new Customization Template was cancelled by the user"))
      end
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node)
    elsif %w[add save].include?(params[:button])
      ct = if params[:id]
             find_record_with_rbac(CustomizationTemplate, params[:id])
           else
             @edit[:new][:typ] == "CustomizationTemplateKickstart" ? CustomizationTemplateKickstart.new : CustomizationTemplateSysprep.new
           end
      if @edit[:new][:name].blank?
        add_flash(_("Name is required"), :error)
      end
      if @edit[:new][:typ].blank?
        add_flash(_("Type is required"), :error)
      end
      if @flash_array
        javascript_flash
        return
      end

      template_set_record_vars(ct)

      if !flash_errors? && ct.valid? && ct.save
        if ct.id
          add_flash(_("Customization Template \"%{name}\" was saved") % {:name => get_record_display_name(ct)})
        else
          add_flash(_("Customization Template \"%{name}\" was added") % {:name => get_record_display_name(ct)})
        end
        AuditEvent.success(build_created_audit(ct, @edit))
        @edit = session[:edit] = nil # clean out the saved info
        self.x_node = "xx-xx-#{ct.pxe_image_type.id}"
        get_node_info(x_node)
        replace_right_cell(:nodetype => x_node, :replace_trees => [:customization_templates])
      else
        @in_a_form = true
        ct.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        javascript_flash
      end
    elsif params[:button] == "reset"
      add_flash(_("All changes have been reset"), :warning)
      @in_a_form = true
      customization_template_edit
    end
  end

  private #######################

  # Get variables from edit form
  def template_get_form_vars
    @ct = @edit[:ct_id] ? CustomizationTemplate.find(@edit[:ct_id]) : CustomizationTemplate.new
    copy_params_if_present(@edit[:new], params, %i[name description typ])
    @edit[:new][:img_type] = params[:img_typ] if params[:img_typ]
    @edit[:new][:script] = params[:script_data] if params[:script_data]
    @edit[:new][:script] = @edit[:new][:script] + "..." if !params[:name] && !params[:description] && !params[:img_typ] && !params[:script_data] && !params[:typ]
  end

  # Set form variables for edit
  def template_set_form_vars
    @edit = {}
    @edit[:ct_id] = @ct.id

    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "ct_edit__#{@ct.id || "new"}"
    @edit[:rec_id] = @ct.id || nil
    @edit[:pxe_image_types] = PxeImageType.order(:name).collect { |img| [img.name, img.id] }
    @edit[:new][:name] = @ct.name
    @edit[:new][:description] = @ct.description
    @edit[:new][:typ] = @ct.type
    # in case record is being copied
    @edit[:new][:img_type] = if @ct.id || @ct.pxe_image_type_id
                               @ct.pxe_image_type.id
                             else
                               # if new customization template, check if add button was pressed form folder level, to auto select image type
                               x_node == "T" ? @ct.pxe_image_type : x_node.split('_')[1]
                             end

    @edit[:new][:script] = @ct.script || ""
    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
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
