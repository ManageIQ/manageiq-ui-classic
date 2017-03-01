# Setting Accordion methods included in OpsController.rb
module StorageController::StorageD
  extend ActiveSupport::Concern

  def storage_tree_select
    @lastaction = "explorer"
    _typ, id = params[:id].split("_")
    @record = Storage.find(from_cid(id))
  end

  def storage_list
    @lastaction = "storage_list"
    @force_no_grid_xml   = true
    @gtl_type            = "list"
    @ajax_paging_buttons = true
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.shore_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
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
    @right_cell_text = _("All %{title} Datastores") % {:title => ui_lookup(:ui_title => "datastore")}
  end

  private #######################

  # Get information for an event
  def storage_build_tree
    TreeBuilderStorage.new("storage_tree", "storage", @sb)
  end

  def storage_get_node_info(treenodeid)
    if treenodeid == "root"
      options = {:model => "Storage"}
      process_show_list(options)
      @right_cell_text = _("All %{models}") % {:models => ui_lookup(:models => "Storage")}
    else
      nodes = treenodeid.split("-")
      if nodes[0] == "ds"
        @right_cell_div = "storage_details"
        @record = @storage = Storage.find_by_id(from_cid(nodes.last))
        @right_cell_text = _("%{model} \"%{name}\"") % {:name => @storage.name, :model => ui_lookup(:model => "Storage")}
      else
        miq_search_node
       end
    end
  end
end
