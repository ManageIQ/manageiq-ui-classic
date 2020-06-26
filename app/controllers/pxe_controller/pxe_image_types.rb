# Setting Accordion methods included in OpsController.rb
module PxeController::PxeImageTypes
  extend ActiveSupport::Concern

  def pxe_image_type_new
    assert_privileges("pxe_image_type_new")
    @pxe_image_type = PxeImageType.new
    pxe_image_type_set_form_vars
    @in_a_form = true
    replace_right_cell(:nodetype => "pit")
  end

  def pxe_image_type_edit
    assert_privileges("pxe_image_type_edit")
    if params[:button] == "cancel"
      id = params[:id] || "new"
      return unless load_edit("pxe_image_type_edit__#{id}", "replace_cell__explorer")
      if @edit[:pxe_id]
        add_flash(_("Edit of System Image Type \"%{name}\" was cancelled by the user") % {:name => @edit[:current][:name]})
      else
        add_flash(_("Add of new System Image Type was cancelled by the user"))
      end
      @edit = session[:edit] = nil # clean out the saved info
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node)
    elsif %w[add save].include?(params[:button])
      id = params[:id] || "new"
      return unless load_edit("pxe_image_type_edit__#{id}", "replace_cell__explorer")
      pxe_image_type_get_form_vars
      add_pxe = params[:id] ? find_record_with_rbac(PxeImageType, params[:id]) : PxeImageType.new
      pxe_image_type_validate_fields
      if @flash_array
        javascript_flash
        return
      end

      pxe_image_type_set_record_vars(add_pxe)

      if add_pxe.save
        AuditEvent.success(build_created_audit(add_pxe, @edit))
        @edit = session[:edit] = nil # clean out the saved info
        add_flash(_("System Image Type \"%{name}\" was added") % {:name => add_pxe.name})
        get_node_info(x_node)
        replace_right_cell(:nodetype => x_node, :replace_trees => %i[pxe_image_types customization_templates])
      else
        @in_a_form = true
        add_pxe.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        javascript_flash
      end
    else
      # first time in or reset
      add_flash(_("All changes have been reset"), :warning) if params[:button] == "reset"
      @pxe_image_type = @record = find_record_with_rbac(PxeImageType, @_params[:id] = checked_or_params.first)
      pxe_image_type_set_form_vars
      @in_a_form = true
      session[:changed] = false
      replace_right_cell(:nodetype => "pit")
    end
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def pxe_image_type_form_field_changed
    assert_privileges(params[:id] == 'new' ? 'pxe_image_type_new' : 'pxe_image_type_edit')
    return unless load_edit("pxe_image_type_edit__#{params[:id]}", "replace_cell__explorer")
    pxe_image_type_get_form_vars
    render :update do |page|
      page << javascript_prologue
      page.replace_html("form_div", :partial => "pxe_image_type_form") if params[:provision_type]
      changed = (@edit[:new] != @edit[:current])
      page << javascript_for_miq_button_visibility(changed)
    end
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
    @force_no_grid_xml   = true
    @gtl_type            = "list"
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
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

  # Set form variables for edit
  def pxe_image_type_set_form_vars
    @edit = {}
    @edit[:pxe_id] = @pxe_image_type.id
    @edit[:prov_types] = {:host => _('Host'), :vm => _('VM and Instance')}
    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "pxe_image_type_edit__#{@pxe_image_type.id || "new"}"
    @edit[:rec_id] = @pxe_image_type.id || nil

    @edit[:new][:name] = @pxe_image_type.name
    @edit[:new][:provision_type] = @pxe_image_type.provision_type
    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
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
