class UtilizationController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  menu_section(:opt)

  include OptimizeHelper

  def index
    @explorer = true
    @trees = [] # TODO: TreeBuilder
    @breadcrumbs = []
    self.x_active_tree = 'utilization_tree'

    @accords = [{
      :name      => "enterprise",
      :title     => _("Utilization"),
      :container => "utilization_accord",
      :image     => "enterprise"
    }]

    @right_cell_text = _("Utilization Summary")
    @trees << TreeBuilderUtilization.new(
      :utilization_tree, :utilization, @sb, true, :selected_node => x_node(:utilization_tree)
    )

    @sb[:active_tab] = "summary"
    self.x_node ||= ""
    @sb[:util] = {}            # reset existing values
    @sb[:util][:options] = {}  # reset existing values
    get_time_profiles # Get time profiles list (global and user specific)

    # Get the time zone from the time profile, if one is in use
    if @sb[:util][:options][:time_profile]
      tp = TimeProfile.find_by(:id => @sb[:util][:options][:time_profile])
      set_time_profile_vars(tp, @sb[:util][:options])
    else
      set_time_profile_vars(selected_time_profile_for_pull_down, @sb[:util][:options])
    end

    @ajax_action = "chart_chooser"
    render :layout => "application"
  end

  # Process changes to capacity charts
  def chart_chooser
    unless params[:task_id] # Only do this first time thru
      @sb[:util][:options][:chart_date] = params[:miq_date_1] if params[:miq_date_1]
      @sb[:util][:options][:chart_date] = params[:miq_date_2] if params[:miq_date_2]
      @sb[:util][:options][:days] = params[:details_days] if params[:details_days]
      @sb[:util][:options][:days] = params[:report_days] if params[:report_days]
      @sb[:util][:options][:days] = params[:summ_days] if params[:summ_days]
      @sb[:util][:options][:tz] = params[:details_tz] if params[:details_tz]
      @sb[:util][:options][:tz] = params[:report_tz] if params[:report_tz]
      @sb[:util][:options][:tz] = params[:summ_tz] if params[:summ_tz]
      @sb[:util][:options][:tag] = params[:details_tag] == "<None>" ? nil : params[:details_tag] if params[:details_tag]
      @sb[:util][:options][:tag] = params[:report_tag] == "<None>" ? nil : params[:report_tag] if params[:report_tag]
      @sb[:util][:options][:tag] = params[:summ_tag] == "<None>" ? nil : params[:summ_tag] if params[:summ_tag]
      @sb[:util][:options][:index] = params[:chart_idx] == "clear" ? nil : params[:chart_idx] if params[:chart_idx]
      if params.key?(:details_time_profile) || params.key?(:report_time_profile) || params.key?(:summ_time_profile)
        @sb[:util][:options][:time_profile] = params[:details_time_profile].blank? ? nil : params[:details_time_profile].to_i if params.key?(:details_time_profile)
        @sb[:util][:options][:time_profile] = params[:report_time_profile].blank? ? nil : params[:report_time_profile].to_i if params.key?(:report_time_profile)
        @sb[:util][:options][:time_profile] = params[:summ_time_profile].blank? ? nil : params[:summ_time_profile].to_i if params.key?(:summ_time_profile)
        tp = TimeProfile.find(@sb[:util][:options][:time_profile]) unless @sb[:util][:options][:time_profile].blank?
        @sb[:util][:options][:time_profile_tz] = @sb[:util][:options][:time_profile].blank? ? nil : tp.tz
        @sb[:util][:options][:time_profile_days] = @sb[:util][:options][:time_profile].blank? ? nil : tp.days
      end
    end
    if x_node != ""
      get_node_info(x_node, "n")
      perf_util_daily_gen_data("n")
    end
    @right_cell_text ||= _("Utilization Summary")
    replace_right_cell(@nodetype) unless @waiting # Draw right side if task is done
  end

  # Send the current utilization report data in text, CSV, or PDF
  def report_download
    report = MiqReport.new(:title     => @sb[:util][:title],
                           :cols      => cols = %w(section item value),
                           :col_order => cols,
                           :headers   => [_("Section"), _("Item"), _("Value")],
                           :sortby    => ["section"],
                           :extras    => {},
                           :group     => "y")
    report.db = "MetricRollup"
    report.table = MiqReportable.hashes2table(summ_hashes, :only => report.cols)
    filename = report.title
    disable_client_cache
    case params[:typ]
    when "txt"
      send_data(report.to_text,
                :filename => "#{filename}.txt")
    when "csv"
      send_data(report.to_csv,
                :filename => "#{filename}.csv")
    when "pdf"
      render_pdf(report)
    end
  end

  def tree_select
    if params[:id] # First time thru async method, grab id parm info
      @refresh = (x_node == "")
      self.x_node = params[:id]
    end

    @sb[:util][:options][:tag] = nil # Reset any tag
    get_node_info(x_node)
    perf_util_daily_gen_data
    replace_right_cell(@nodetype) unless @waiting # Draw right side if task is done
  end

  def change_tab
    @sb[:active_tab] = params[:tab_id]

    # build timeline data when coming back to Summary tab for bottlenecks
    render :update do |page|
      page << javascript_prologue
      page << javascript_reload_toolbars
      page << Charting.js_load_statement
      page << "miqSparkle(false);"
    end
  end

  private

  def get_session_data
    @title = _("Utilization")
    @layout ||= "miq_capacity_utilization"
  end

  # Get all info for the node about to be displayed
  def get_node_info(treenodeid, refresh = nil)
    treenodeid = valid_active_node(treenodeid)
    get_nodetype_and_record(treenodeid)
    @right_cell_text = if @record.kind_of?(MiqEnterprise)
                         ui_lookup(:model => "MiqEnterprise")
                       else
                         _("%{model} \"%{name}\" Utilization Trend Summary") %
                           {:model => ui_lookup(:model => @record.class.base_class.to_s), :name => @record.name}
                       end
    @sb[:util][:title] = @right_cell_text
    unless @sb[:util][:options].nil? || @sb[:util][:options][:tag].blank?
      @right_cell_text += _(" - Filtered by %{filter}") % {:filter => @sb[:util][:tags][@sb[:util][:options][:tag]]}
    end

    # Get start/end dates in selected timezone
    tz = @sb[:util][:options][:time_profile_tz] || @sb[:util][:options][:tz] # Use time profile tz or chosen tz, if no profile tz
    s, e = @record.first_and_last_capture
    return if s.nil?
    s = s.in_time_zone(tz)
    e = e.in_time_zone(tz)
    # Eliminate partial start or end days
    s = s.hour.zero? ? s : s + 1.day
    e = e.hour < 23 ? e - 1.day : e
    return if s > e # Don't have a full day's data
    sdate = create_time_in_tz("#{s.year}-#{s.month}-#{s.day} 00", tz) # Start at midnight of start date
    edate = create_time_in_tz("#{e.year}-#{e.month}-#{e.day} 23", tz) # End at 11pm of start date

    unless (refresh == "n" || params[:refresh] == "n") && @sb[:util][:options] && @sb[:util][:options][:model] == @record.class.base_class.to_s
      @sb[:util][:options] ||= {}
      @sb[:util][:options][:typ] = "Daily"
      @sb[:util][:options][:days] ||= "7"
      @sb[:util][:options][:model] = @record.class.base_class.to_s
      @sb[:util][:options][:record_id] = @record.id
    end
    trenddate = edate - @sb[:util][:options][:days].to_i.days + 1.hour # Get trend starting date
    sdate = sdate > trenddate ? sdate : trenddate                   # Use trend date, unless earlier than first date
    if @sb[:util][:options][:chart_date]                            # Clear chosen chart date if out of trend range
      cdate = create_time_in_tz(@sb[:util][:options][:chart_date], tz) # Get chart date at midnight in time zone
      if (cdate < sdate || cdate > edate) || # Reset if chart date is before start date or after end date
         (@sb[:util][:options][:time_profile] && !@sb[:util][:options][:time_profile_days].include?(cdate.wday))
        @sb[:util][:options][:chart_date] = nil
      end
    end
    @sb[:util][:options][:trend_start] = sdate
    @sb[:util][:options][:trend_end] = edate
    @sb[:util][:options][:sdate] = sdate # Start and end dates for calendar control
    @sb[:util][:options][:edate] = edate
    @sb[:util][:options][:chart_date] ||= [edate.month, edate.day, edate.year].join("/")

    if @sb[:util][:options][:time_profile]                              # If profile in effect, set date to a valid day in the profile
      @sb[:util][:options][:skip_days] = skip_days_from_time_profile(@sb[:util][:options][:time_profile_days])

      cdate = @sb[:util][:options][:chart_date].to_date                 # Start at the currently set date
      6.times do                                                        # Go back up to 6 days (try each weekday)
        break if @sb[:util][:options][:time_profile_days].include?(cdate.wday) # If weekday is in the profile, use it
        cdate -= 1.day # Drop back 1 day and try again
      end
      @sb[:util][:options][:chart_date] = [cdate.month, cdate.day, cdate.year].join("/") # Set the new date
    else
      @sb[:util][:options][:skip_days] = nil
    end

    @sb[:util][:options][:days] ||= "7"
    @sb[:util][:options][:ght_type] ||= "hybrid"
    @sb[:util][:options][:chart_type] = :summary
  end

  def replace_right_cell(_nodetype) # replace_trees can be an array of tree symbols to be replaced
    # Get the tags for this node for the Classification pulldown
    @sb[:util][:tags] = nil unless params[:miq_date_1] || params[:miq_date_2] # Clear tags unless just changing date
    unless @nodetype == "h" || @nodetype == "s" || params[:miq_date_1] || params[:miq_date_2] # Get the tags for the pulldown, unless host, storage, or just changing the date
      if @sb[:util][:options][:chart_date]
        mm, dd, yy = @sb[:util][:options][:chart_date].split("/")
        end_date = Time.utc(yy, mm, dd, 23, 59, 59)
        @sb[:util][:tags] = VimPerformanceAnalysis.child_tags_over_time_period(
          @record, 'daily',
          :end_date => end_date, :days => @sb[:util][:options][:days].to_i,
           :ext_options => {:tz           => @sb[:util][:trend_rpt].tz, # Add ext_options for tz from rpt object
                            :time_profile => @sb[:util][:trend_rpt].time_profile}
        )
      end
    end

    v_tb = build_toolbar("miq_capacity_view_tb")
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    presenter.load_chart(@sb[:util][:chart_data])

    # clearing out any selection in tree if active node has been reset to "" upon returning to screen or when first time in
    presenter[:clear_selection] = x_node == ''

    presenter.reload_toolbars(:view => v_tb)
    presenter.set_visibility(@sb[:active_tab] == 'report', :toolbar)

    presenter.update(:main_div, r[:partial => 'utilization_tabs'])
    presenter[:right_cell_text] = @right_cell_text
    presenter[:build_calendar] = {
      :date_from => @sb[:util][:options][:sdate],
      :date_to   => @sb[:util][:options][:edate],
      :skip_days => @sb[:util][:options][:skip_days],
    }

    render :json => presenter.for_render
  end

  # Create an array of hashes from the Utilization summary report tab information
  def summ_hashes
    a = []
    @sb[:util][:summary][:info].each { |r| a.push("section" => _("Basic Info"), "item" => r[0], "value" => r[1]) } if @sb[:util][:summary][:info]
    @sb[:util][:summary][:cpu].each { |r| a.push("section" => _("CPU"), "item" => r[0], "value" => r[1]) } if @sb[:util][:summary][:cpu]
    @sb[:util][:summary][:memory].each { |r| a.push("section" => _("Memory"), "item" => r[0], "value" => r[1]) } if @sb[:util][:summary][:memory]
    @sb[:util][:summary][:storage].each { |r| a.push("section" => _("Disk"), "item" => r[0], "value" => r[1]) } if @sb[:util][:summary][:storage]
    a
  end
end
