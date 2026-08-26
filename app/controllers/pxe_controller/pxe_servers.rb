# Setting Accordion methods included in OpsController.rb
module PxeController::PxeServers
  extend ActiveSupport::Concern

  def pxe_server_new
    assert_privileges("pxe_server_new")
    @ps = PxeServer.new
    @edit = {} # required to disable left tree
    @in_a_form = true
    replace_right_cell(:nodetype => "ps")
  end

  def pxe_server_edit
    assert_privileges("pxe_server_edit")
    @ps = @record = find_record_with_rbac(PxeServer, @_params[:id] = checked_or_params.first)
    @edit = {} # required to disable left tree
    @in_a_form = true
    replace_right_cell(:nodetype => "ps")
  end

  # Refresh the power states for selected or single VMs
  def pxe_server_refresh
    assert_privileges("pxe_server_refresh")
    # pxe_button_operation('sync_images_queue', 'Refresh Relationships')
    pxe_button_operation('synchronize_advertised_images_queue', 'Refresh Relationships')
  end

  # Common VM button handler routines
  def pxe_button_operation(method, display_name)
    pxes = []

    # Either a list or coming from a different controller (eg from host screen, go to its vms)
    if !params[:id]
      pxes = find_checked_items
      if pxes.empty?
        add_flash(_("No PXE Servers were selected to %{button}") % {:button => display_name}, :error)
      else
        process_pxes(pxes, method, display_name)
      end

      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => [:pxe_servers])
    elsif params[:id].nil? || PxeServer.find(params[:id]).nil? # showing 1 vm
      add_flash(_("PXE Server no longer exists"), :error)
      pxe_server_list
      @refresh_partial = "layouts/x_gtl"
    else
      pxes.push(params[:id])
      process_pxes(pxes, method, display_name) unless pxes.empty?
      # TODO: tells callers to go back to show_list because this record may be gone
      # Should be refactored into calling show_list right here
      if method == 'destroy'
        self.x_node = "root"
        @single_delete = true unless flash_errors?
      end
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => [:pxe_servers])
    end
    pxes.count
  end

  def pxe_server_delete
    assert_privileges("pxe_server_delete")
    pxe_button_operation('destroy', 'Delete')
  end

  def pxe_server_list
    assert_privileges('pxe_server_view')
    @lastaction = "pxe_server_list"
    @force_no_grid_xml   = true
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, :list, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:pxe_sortcol].nil? ? 0 : session[:pxe_sortcol].to_i
    @sortdir = session[:pxe_sortdir].nil? ? "ASC" : session[:pxe_sortdir]

    @view, @pages = get_view(PxeServer) # Get the records (into a view) and the paginator

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:pxe_sortcol] = @sortcol
    session[:pxe_sortdir] = @sortdir

    update_gtl_div('pxe_server_list') if params[:action] != "button" && pagination_or_gtl_request?
  end

  def pxe_image_edit
    assert_privileges("pxe_image_edit")
    case params[:button]
    when "save"
      update_img = find_record_with_rbac(PxeImage, params[:id])
      update_img.pxe_image_type = params[:image_typ].blank? ? nil : PxeImageType.find(params[:image_typ])
      update_img.default_for_windows = params[:default_for_windows] == "1"

      if update_img.save
        edit_hash = {
          :new     => {
            :img_type            => params[:image_typ],
            :default_for_windows => params[:default_for_windows] == "1"
          },
          :current => {
            :img_type            => update_img.pxe_image_type_id_was,
            :default_for_windows => update_img.default_for_windows_was
          }
        }
        AuditEvent.success(build_saved_audit(update_img, edit_hash))
        render :json => {:message => "PXE Image \"#{update_img.name}\" was saved"}, :status => 200
      else
        error_messages = []
        update_img.errors.each do |error|
          error_messages << "#{error.attribute.to_s.capitalize} #{error.message}"
        end
        render :json => {:error => error_messages.join(", ")}, :status => 400
      end
    when nil
      @img = PxeImage.find(params[:id])
      pxe_img_set_form_vars
      @in_a_form = true
      session[:changed] = false
      replace_right_cell(:nodetype => "pi")
    end
  end

  def pxe_wimg_edit
    assert_privileges("pxe_wimg_edit")
    case params[:button]
    when "save"
      update_wimg = find_record_with_rbac(WindowsImage, params[:id])
      update_wimg.pxe_image_type = params[:image_typ].blank? ? nil : PxeImageType.find(params[:image_typ])

      if update_wimg.save
        edit_hash = {
          :new     => {
            :img_type => params[:image_typ]
          },
          :current => {
            :img_type => update_wimg.pxe_image_type_id_was
          }
        }
        AuditEvent.success(build_saved_audit(update_wimg, edit_hash))
        render :json => {:message => "Windows Image \"#{update_wimg.name}\" was saved"}, :status => 200
      else
        error_messages = []
        update_wimg.errors.each do |error|
          error_messages << "#{error.attribute.to_s.capitalize} #{error.message}"
        end
        render :json => {:error => error_messages.join(", ")}, :status => 400
      end
    when nil
      @wimg = WindowsImage.find(params[:id])
      pxe_wimg_set_form_vars
      @in_a_form = true
      session[:changed] = false
      replace_right_cell(:nodetype => "wi")
    end
  end

  def pxe_server_async_cred_validation
    begin
      assert_privileges(feature_by_action)
      PxeServer.verify_depot_settings(params[:pxe])
    rescue StandardError => bang
      render :json => {:status => 'error', :message => _("Error during 'Validate': %{error_message}") % {:error_message => bang.message}}
    end

    render :json => {:status => 'success', :message => _('PXE Credentials successfully validated')}
  end

  private #######################

  # Set form variables for edit
  def pxe_img_set_form_vars
    @edit = {}
    @edit[:img] = @img

    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "pxe_img_edit__#{@img.id || "new"}"
    @edit[:rec_id] = @img.id || nil
    @edit[:pxe_image_types] = PxeImageType.order(:name).collect { |img| [img.name, img.id] }
    @edit[:new][:img_type] = @img.pxe_image_type.try(:id)
    @edit[:new][:default_for_windows] = @img.default_for_windows

    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  # Set form variables for edit
  def pxe_wimg_set_form_vars
    @edit = {}
    @edit[:wimg] = @wimg

    @edit[:new] = {}
    @edit[:current] = {}
    @edit[:key] = "pxe_wimg_edit__#{@wimg.id || "new"}"
    @edit[:rec_id] = @wimg.id || nil
    @edit[:pxe_image_types] = PxeImageType.order(:name).collect { |img| [img.name, img.id] }
    @edit[:new][:img_type] = @wimg.pxe_image_type.try(:id)

    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  # Common Schedule button handler routines
  def process_pxes(pxes, task, display_name)
    process_elements(pxes, PxeServer, task, display_name)
  end

  def pxe_server_get_node_info(treenodeid)
    if treenodeid == "root"
      pxe_server_list
      @right_cell_text = _("All PXE Servers")
      @right_cell_div  = "pxe_server_list"
    else
      @right_cell_div = "pxe_server_details"
      nodes = treenodeid.split("-")
      if (nodes[0] == "ps" && nodes.length == 2) || (%w[pxe_xx win_xx].include?(nodes[1]) && nodes.length == 3)
        # on pxe server node OR folder node is selected
        @record = @ps = PxeServer.find(nodes.last)
        session[:tag_db] = "PxeServer"
        @right_cell_text = _("PXE Server \"%{name}\"") % {:name => @ps.name}
      elsif nodes[0] == "pi"
        @record = @img = PxeImage.find(nodes.last)
        session[:tag_db] = "PxeImage"
        @right_cell_text = _("PXE Image \"%{name}\"") % {:name => @img.name}
      elsif nodes[0] == "wi"
        @record = @wimg = WindowsImage.find(nodes[1])
        session[:tag_db] = "WindowsImage"
        @right_cell_text = _("Windows Image \"%{name}\"") % {:name => @wimg.name}
      end
      get_tagdata(@record)
    end
  end
end
