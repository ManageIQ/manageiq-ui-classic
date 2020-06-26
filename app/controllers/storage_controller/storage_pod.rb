# Setting Accordion methods included in OpsController.rb
module StorageController::StoragePod
  extend ActiveSupport::Concern

  def storage_pod_list
    assert_privileges('storage_pod_show_list')
    @lastaction = "storage_pod_list"
    @force_no_grid_xml   = true
    @gtl_type            = "list"
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:dsc_sortcol].nil? ? 0 : session[:dsc_sortcol].to_i
    @sortdir = session[:dsc_sortdir].nil? ? "ASC" : session[:dsc_sortdir]

    dsc_id = x_node.split('-').last
    @view, @pages = get_view(Storage, :association => 'storages', :parent => EmsFolder.find(dsc_id))

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:ct_sortcol] = @sortcol
    session[:ct_sortdir] = @sortdir

    update_gtl_div('template_list') if params[:action] != "button" && pagination_or_gtl_request?
  end

  private #######################

  def storage_pod_get_node_info(treenodeid)
    if treenodeid == "root"
      @folders = StorageCluster.all.sort
      # to check if Add customization template button should be enabled
      @right_cell_text = _("All Datastore Clusters")
      @right_cell_div  = "storage_pod_list"
    else
      nodes = treenodeid.split("-")
      if nodes[0] == "ds"
        @right_cell_div = "storage_details"
        @record = Storage.find(nodes[1])
        @right_cell_text = _("Datastore \"%{name}\"") % {:name => @record.name}
      else
        storage_pod_list
        dsc_id = x_node.split('-').last
        @record = @storage_pod = EmsFolder.find(dsc_id)
        @right_cell_text = _("Datastores in cluster %{name}") % {:name => @record.name}
        @right_cell_div  = "storage_list"
      end
    end
  end
end
