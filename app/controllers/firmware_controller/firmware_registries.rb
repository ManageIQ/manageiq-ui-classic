# Setting Accordion methods included in OpsController.rb
module FirmwareController::FirmwareRegistries
  extend ActiveSupport::Concern

  def firmware_registry_list
    @lastaction = "firmware_registry_list"
    @force_no_grid_xml   = true
    @gtl_type            = "list"
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:firmware_sortcol].nil? ? 0 : session[:firmware_sortcol].to_i
    @sortdir = session[:firmware_sortdir].nil? ? "ASC" : session[:firmware_sortdir]

    @view, @pages = get_view(FirmwareRegistry) # Get the records (into a view) and the paginator

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:firmware_sortcol] = @sortcol
    session[:firmware_sortdir] = @sortdir

    update_gtl_div('firmware_registry_list') if params[:action] != "button" && pagination_or_gtl_request?
  end

  # Get information for an event
  def build_firmware_registries_tree
    TreeBuilderFirmwareRegistries.new("firmware_registries_tree", @sb)
  end

  def firmware_registry_get_node_info(treenodeid)
    if treenodeid == "root"
      firmware_registry_list
      @right_cell_text = _("All Firmware Registries")
      @right_cell_div  = "firmware_registry_list"
    else
      @right_cell_div = "firmware_registry_details"
      nodes = treenodeid.split("-")
      if (nodes[0] == "ps" && nodes.length == 2) || (%w[pxe_xx win_xx].include?(nodes[1]) && nodes.length == 3)
        # on pxe server node OR folder node is selected
        @record = @ps = PxeServer.find(nodes.last)
        @right_cell_text = _("PXE Server \"%{name}\"") % {:name => @ps.name}
      elsif nodes[0] == "pi"
        @record = @img = PxeImage.find(nodes.last)
        @right_cell_text = _("PXE Image \"%{name}\"") % {:name => @img.name}
      elsif nodes[0] == "wi"
        @record = @wimg = WindowsImage.find(nodes[1])
        @right_cell_text = _("Windows Image \"%{name}\"") % {:name => @wimg.name}
      end
    end
  end
end
