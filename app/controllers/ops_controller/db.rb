# Database Accordion methods included in OpsController.rb
module OpsController::Db
  extend ActiveSupport::Concern

  # Show list of VMDB tables or settings
  def db_list(exp = nil)
    @lastaction = "db_list"
    @force_no_grid_xml = true
    model = case @sb[:active_tab] # Build view based on tab selected
            when "db_connections" then VmdbDatabaseConnection
            when "db_details"     then VmdbTableEvm
            when "db_indexes"     then VmdbIndex
            when "db_settings"    then VmdbDatabaseSetting
            end

    if model == VmdbIndex
      # building a filter with expression to show VmdbTableEvm tables only
      exp = MiqExpression.new(
        "and" => [
          {
            "=" => {
              "value" => "VmdbTableEvm",
              "field" => "VmdbIndex.vmdb_table-type"
            }
          }
        ]
      )
    elsif model == VmdbDatabaseConnection
      @zones = Zone.visible.order(:name).collect { |z| [z.name, z.name] }
      # for now we dont need this pulldown, need to get a method that gives us a list of workers for filter pulldown
      # @workers = MiqWorker.all.sort_by(&:type).collect { |w| [w.friendly_name, w.id] }
    end

    @view, @pages = get_view(model, :filter => exp || nil) # Get the records (into a view) and the paginator

    @no_checkboxes = true
    @showlinks = true # Need to set @showlinks if @no_checkboxes is set to true
    @current_page = @pages[:current] unless @pages.nil? # save the current page number

    if @show_list
      update_gtl_div('db_list') if params[:action] == "list_view_filter" || pagination_or_gtl_request?
    end
  end

  def list_view_filter
    @sb[:condition] = []
    @sb[:zone_name] = params[:zone_name] if params[:zone_name]
    @sb[:filter_text] = params[:filter][:text] if params[:filter] && params[:filter][:text]

    if params[:zone_name] && params[:zone_name] != "all"
      @sb[:zone_name] = params[:zone_name]
      cond_hash = {}
      cond_hash["="] = {"value" => params[:zone_name], "field" => "VmdbDatabaseConnection-zone.name"}
      @sb[:condition].push(cond_hash)
    end
    if params[:filter] && params[:filter][:text] != ""
      # @sb[:cond] =  ["vmdb_database_connection.address like ?", params[:filter][:text]]
      cond_hash = {}
      cond_hash["like"] = {"value" => params[:filter][:text], "field" => "VmdbDatabaseConnection-address"}
      @sb[:condition].push(cond_hash)
    end
    condition = {}
    condition["and"] = []
    @sb[:condition].each do |c|
      condition["and"].push(c)
    end
    exp = MiqExpression.new(condition)
    # forcing to refresh the view when filtering results
    @_params[:refresh] = "y"
    db_list(exp)
  end

  # VM clicked on in the explorer right cell
  def x_show
    # @explorer = true
    @record = VmdbIndex.find(params[:id])
    params[:id] = x_build_node_id(@record) # Get the tree node id
    tree_select
  end

  private #######################

  # Get information for a DB tree node
  def db_get_info
    if x_node == "root"
      # If root node is selected
      if @sb[:active_tab] == "db_summary"
        @record = VmdbDatabase.my_database
        @right_cell_text = _("VMDB Summary")
      elsif @sb[:active_tab] == "db_utilization"
        @record = VmdbDatabase.my_database
        if @record
          perf_gen_init_options # Initialize perf chart options, charts will be generated async
          @sb[:record_class] = @record.class.base_class.name # Hang on to record class/id for async trans
          @sb[:record_id] = @record.id
        end
        @right_cell_text = _("VMDB Utilization")
      else
        @right_cell_text = case @sb[:active_tab]
                           when "db_connections" then _("VMDB Client Connections")
                           when "db_details"     then _("All VMDB Tables")
                           when "db_indexes"     then _("All VMDB Indexes")
                           else                       _("VMDB Settings")
                           end
        @force_no_grid_xml = true
        db_list
      end
      @tab_text = _("Tables")
    elsif @sb[:active_tab] == "db_indexes" || params[:action] == "x_show" # if table is selected
      nodes = x_node.split('-')
      if nodes.first == "xx"
        tb = VmdbTableEvm.find(nodes.last)
        @indexes = get_indexes(tb)
        @right_cell_text = _("Indexes for VMDB Table \"%{name}\"") % {:name => tb.name}
        @tab_text = "%{table_name} Indexes" % {:table_name => tb.name}
      else
        @vmdb_index = VmdbIndex.find(nodes.last)
        @right_cell_text = _("VMDB Index \"%{name}\"") % {:name => @vmdb_index.name}
        @tab_text = @vmdb_index.name
      end
    elsif @sb[:active_tab] == "db_utilization"
      @record = VmdbTable.find(x_node.split('-').last)
      perf_gen_init_options # Initialize perf chart options, charts will be generated async
      @sb[:record_class] = @record.class.base_class.name # Hang on to record class/id for async trans
      @sb[:record_id] = @record.id
      @right_cell_text = _("VMDB \"%{name}\" Table Utilization") % {:name => @record.name}
      @tab_text = @record.name
    else
      @sb[:active_tab] = "db_details"
      @table = VmdbTable.find(x_node.split('-').last)
      @indexes = get_indexes(@table)
      @right_cell_text = _("VMDB Table \"%{name}\"") % {:name => @table.name}
      @tab_text = @table.name
    end
  end

  def get_indexes(tb)
    return [] unless tb.kind_of?(VmdbTableEvm)

    tb.vmdb_indexes.sort_by(&:name)
  end

  def db_refresh
    assert_privileges("db_refresh")
    db_get_info
    render :update do |page|
      page << javascript_prologue
      page.replace_html(@sb[:active_tab], :partial => "db_details_tab")
      page << "miqSparkle(false);" # Need to turn off sparkle in case original ajax element gets replaced
    end
  end
end
