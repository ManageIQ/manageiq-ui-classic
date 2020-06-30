# Setting Accordion methods included in OpsController.rb
module StorageController::StorageD
  extend ActiveSupport::Concern

  def storage_list
    assert_privileges('storage_show_list')
    @lastaction = "storage_list"
    @force_no_grid_xml   = true
    @gtl_type            = "list"
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:storage_sortcol].nil? ? 0 : session[:storage_sortcol].to_i
    @sortdir = session[:storage_sortdir].nil? ? "ASC" : session[:storage_sortdir]

    @view, @pages = get_view(Storage) # Get the records (into a view) and the paginator

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:storage_sortcol] = @sortcol
    session[:storage_sortdir] = @sortdir

    update_gtl_div('storage_list') if params[:action] != "button" && pagination_or_gtl_request?
  end

  def miq_search_node
    options = {:model => "Storage"}
    process_show_list(options)
    @right_cell_text = _("All Datastores")
  end

  private #######################

  def storage_get_node_info(treenodeid)
    if treenodeid == "root"
      options = {:model => "Storage"}
      process_show_list(options)
      @right_cell_text = _("All Datastores")
    else
      nodes = treenodeid.split("-")
      if nodes[0] == "ds"
        @right_cell_div = "storage_details"
        @record = Storage.find(nodes.last)
        @right_cell_text = _("Datastore \"%{name}\"") % {:name => @record.name}
      else
        miq_search_node
      end
    end
  end
end
