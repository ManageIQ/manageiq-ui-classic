class BottlenecksController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  menu_section(:opt)

  include OptimizeHelper

  def index
    @explorer = true
    @trees = [] # TODO: TreeBuilder
    @explorer = true
    @layout = "miq_capacity_bottlenecks"
    self.x_active_tree = 'bottlenecks_tree'

    @accords = [{
      :name      => "bottlenecks",
      :title     => _("Bottlenecks"),
      :container => "bottlenecks_accord",
      :image     => "enterprise"
    }]

    @trees << TreeBuilderUtilization.new(
      :bottlenecks_tree, :bottlenecks, @sb, true, :selected_node => x_node(:bottlenecks_tree)
    )
    @right_cell_text = _("Bottlenecks Summary")

    @sb[:active_tab] = "summary"
    self.x_node ||= ""
    @sb[:bottlenecks] ||= {} # Leave existing values
    @timeline = true
    if @sb[:bottlenecks][:report]
      tl_to_xml # Use existing report to generate timeline
    end
    get_node_info(x_node)  if x_node != "" # Get the bottleneck info for the tree node
    render :layout => "application"
  end

  def change_tab
    @sb[:active_tab] = params[:tab_id]

    # build timeline data when coming back to Summary tab for bottlenecks
    displaying_timeline = @sb[:active_tab] == "summary"
    bottleneck_get_node_info(x_node) if displaying_timeline

    render :update do |page|
      page << javascript_prologue
      page << javascript_reload_toolbars
      page.replace("tl_div", :partial => "bottlenecks_tl_detail") if displaying_timeline
      page << Charting.js_load_statement
      page << "miqSparkle(false);"
    end
  end

  def tree_select
    if params[:id] # First time thru async method, grab id parm info
      @refresh = (x_node == "")
      self.x_node = params[:id]
    end
    if @refresh # need to set tl_options if node was "" initially
      get_node_info(x_node)
    else
      get_node_info(x_node, "n")
    end
    replace_right_cell
  end

  # Process changes to timeline selection
  def tl_chooser
    @sb[:bottlenecks][:tl_options][:filter1] = params["tl_summ_fl_grp1"] if params["tl_summ_fl_grp1"]
    @sb[:bottlenecks][:tl_options][:filter1] = params["tl_report_fl_grp1"] if params["tl_report_fl_grp1"]
    @sb[:bottlenecks][:tl_options][:hosts] = params["tl_summ_hosts"] == "1" if params.key?("tl_summ_hosts")
    @sb[:bottlenecks][:tl_options][:hosts] = params["tl_report_hosts"] == "1" if params.key?("tl_report_hosts")
    @sb[:bottlenecks][:tl_options][:tz] = params["tl_summ_tz"] if params["tl_summ_tz"]
    @sb[:bottlenecks][:tl_options][:tz] = params["tl_report_tz"] if params["tl_report_tz"]
    show_timeline("n")
    replace_right_cell
  end

  def reload
    @_params[:id] = x_node
    tree_select
  end

  private

  def get_session_data
    @title = _("Bottlenecks")
    @layout ||= "miq_capacity_bottlenecks"
  end

  def replace_right_cell
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    presenter[:osf_node] = x_node
    if params.keys.any? { |param| param.include?('tl_report') }
      presenter.replace(:bottlenecks_report_div, r[:partial => 'bottlenecks_report'])
    elsif params.keys.any? { |param| param.include?('tl_summ') }
      presenter.replace(:bottlenecks_summary_div, r[:partial => 'bottlenecks_summary'])
    else
      presenter.update(:main_div, r[:partial => 'bottlenecks_tabs'])
    end
    presenter[:build_calendar] = true
    presenter[:right_cell_text] = @right_cell_text

    render :json => presenter.for_render
  end

  def get_node_info(treenodeid, refresh = nil)
    treenodeid = valid_active_node(treenodeid)
    @timeline = true
    @lastaction = "show_timeline"

    get_nodetype_and_record(treenodeid)

    @right_cell_text = if @record.kind_of?(MiqEnterprise)
                         ui_lookup(:model => "MiqEnterprise")
                       else
                         _("%{model} \"%{name}\" Bottlenecks Summary") % {:model => ui_lookup(:model => @record.class.base_class.to_s), :name => @record.name}
                       end

    # Get the where clause to limit records to the selected tree node (@record)
    @sb[:bottlenecks][:objects_where_clause] = nil
    unless @nodetype == "root"
      # Call method to get where clause to filter child objects
      @sb[:bottlenecks][:objects_where_clause] = BottleneckEvent.event_where_clause(@record)
    end
    @sb[:active_tab] = "summary" # reset tab back to first tab when node is changed in the tree
    show_timeline(refresh) # Create the timeline report
  end

  def show_timeline(refresh = nil)
    unless refresh == "n" || params[:refresh] == "n" # ||
      objects_where_clause = @sb[:bottlenecks][:objects_where_clause]
      @sb[:bottlenecks] = {}
      @sb[:bottlenecks][:objects_where_clause] = objects_where_clause
      @sb[:bottlenecks][:tl_options] = {}
      @sb[:bottlenecks][:tl_options][:model] = "BottleNeck"
      @sb[:bottlenecks][:tl_options][:tz] = session[:user_tz]
    end
    @sb[:bottlenecks][:groups] = []
    @tl_groups_hash = {}
    EmsEvent.bottleneck_event_groups.each do |gname, list|
      @sb[:bottlenecks][:groups].push(list[:name].to_s)
      @tl_groups_hash[gname] ||= []
      @tl_groups_hash[gname].concat(list[:detail]).uniq!
    end
    if @sb[:bottlenecks][:tl_options][:filter1].blank?
      @sb[:bottlenecks][:tl_options][:filter1] = "ALL"
    end

    if params["tl_summ_tz"] || params["tl_report_tz"] # Don't regenerate the report if only timezone changed
      @sb[:bottlenecks][:report].tz = @sb[:bottlenecks][:tl_options][:tz] # Set the new timezone
      @title = @sb[:bottlenecks][:report].title
      tl_to_xml
    else
      @sb[:bottlenecks][:report] = MiqReport.new(YAML.load(File.open("#{ApplicationController::TIMELINES_FOLDER}/miq_reports/tl_bottleneck_events.yaml")))
      @sb[:bottlenecks][:report].headers.map! { |header| _(header) }
      @sb[:bottlenecks][:report].tz = @sb[:bottlenecks][:tl_options][:tz] # Set the new timezone
      @title = @sb[:bottlenecks][:report].title

      event_set = []
      if @sb[:bottlenecks][:tl_options][:filter1] != "ALL"
        @tl_groups_hash.each do |name, fltr|
          next unless name.to_s == @sb[:bottlenecks][:tl_options][:filter1].to_s
          fltr.each do |f|
            event_set.push(f) unless event_set.include?(f)
          end
        end
      else
        @tl_groups_hash.each do |_name, fltr|
          fltr.each do |f|
            event_set.push(f) unless event_set.include?(f)
          end
        end
      end

      @sb[:bottlenecks][:report].where_clause = if @sb[:bottlenecks][:objects_where_clause]
                                                  "(#{@sb[:bottlenecks][:objects_where_clause]}) AND (#{BottleneckEvent.send(:sanitize_sql_for_conditions, ["event_type in (?)", event_set])})"
                                                else
                                                  BottleneckEvent.send(:sanitize_sql_for_conditions, ["event_type in (?)", event_set])
                                                end

      # Don't include Host resource types based on option - exclude host and storage nodes
      unless @sb[:bottlenecks][:tl_options][:hosts] ||
             %w(h s).include?(x_node.split("-").last.split("_").first) ||
             'ds'.include?(x_node.split('-').first)
        @sb[:bottlenecks][:report].where_clause = "(#{@sb[:bottlenecks][:report].where_clause}) AND resource_type != 'Host'"
      end

      begin
        @sb[:bottlenecks][:report].generate_table(:userid => session[:userid])
      rescue => bang
        add_flash(_("Error building timeline %{error_message}") % {:error_message => bang.message}, :error)
      else
        tl_to_xml
      end
    end
  end

  # Create timeline xml from report data
  def tl_to_xml
    @timeline = true
    if @sb[:bottlenecks][:report].table.data.empty?
      @flash_array = nil
      add_flash(_("No records found for this timeline"), :warning)
    else
      tz = @sb[:bottlenecks][:report].tz ? @sb[:bottlenecks][:report].tz : Time.zone
      @sb[:bottlenecks][:report].extras[:browser_name] = browser_info(:name)
      @tl_json = @sb[:bottlenecks][:report].to_timeline
      #         START of TIMELINE TIMEZONE Code
      #     session[:tl_position] = @sb[:bottlenecks][:report].extras[:tl_position]
      session[:tl_position] = format_timezone(@sb[:bottlenecks][:report].extras[:tl_position], tz, "tl")
      #         END of TIMELINE TIMEZONE Code
    end
  end
end
