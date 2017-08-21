module ApplicationController::Performance
  extend ActiveSupport::Concern

  CHARTS_REPORTS_FOLDER = Rails.root.join("product", "charts", "miq_reports")
  CHARTS_LAYOUTS_FOLDER = Rails.root.join("product", "charts", "layouts")

  # Process changes to performance charts
  def perf_chart_chooser
    assert_privileges("perf_reload")
    @record = identify_tl_or_perf_record
    @perf_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record

    unless params[:task_id] # first time thru, gather options changed by the user
      @perf_options.update_from_params(params)
      perf_set_or_fix_dates(!params[:perf_typ]) if @perf_options[:chart_type] == :performance
    end

    if !@no_util_data && @perf_options[:chart_type] == :performance
      perf_gen_data # generate the task
      return unless @charts # no charts got created (first time thru async rpt gen)
    end

    if @perf_options[:no_rollups]
      add_flash(_("No Hourly or Daily data is available, real time data " \
                  "from the Most Recent Hour is being displayed"), :warning)
    end

    add_flash(_('No Daily data is available'), :warning) if @perf_options[:no_daily] && @perf_options[:typ] == 'Daily'

    render :update do |page|
      page << javascript_prologue
      if @parent_chart_data
        page << 'ManageIQ.charts.chartData = ' + {
          "candu"  => @chart_data,
          "parent" => @parent_chart_data
        }.to_json + ';'
      elsif @compare_vm_chart_data
        page << 'ManageIQ.charts.chartData = ' + {
          "candu"     => @chart_data,
          "comparevm" => @compare_vm_chart_data
        }.to_json + ';'
      else
        page << 'ManageIQ.charts.chartData = ' + {
          "candu" => @chart_data
        }.to_json + ';'
      end

      # Cannot replace button divs that contain toolbars, use code below to turn on/off individual buttons
      # Don't need to do view or center buttons, just the perf stuff
      if ["host", "vm", "vm_or_template"].include?(params[:controller])
        pfx = params[:controller] == "vm_or_template" ? "vm_" : ""
        if @perf_options[:typ] == "realtime"
          page << "ManageIQ.toolbars.showItem('#center_tb', '#{pfx}perf_refresh');"
          page << "ManageIQ.toolbars.showItem('#center_tb', '#{pfx}perf_reload');"
          page << "ManageIQ.toolbars.enableItem('#center_tb', '#{pfx}perf_refresh');"
          page << "ManageIQ.toolbars.enableItem('#center_tb', '#{pfx}perf_reload');"
        else
          page << "ManageIQ.toolbars.hideItem('#center_tb', '#{pfx}perf_refresh');"
          page << "ManageIQ.toolbars.hideItem('#center_tb', '#{pfx}perf_reload');"
        end
      end

      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page.replace("perf_options_div", :partial => "layouts/perf_options")
      page.replace("candu_charts_div", :partial => "layouts/perf_charts",
                                       :locals  => {:chart_data => @chart_data, :chart_set => "candu"})
      unless @no_util_data
        page << js_build_calendar(@perf_options.to_calendar)
        page << Charting.js_load_statement
      end
      page << 'miqSparkle(false);'
      if request.parameters["controller"] == "storage" && @perf_options[:cat]
        page << javascript_disable_field('perf_typ')
      end
    end
  end

  # Generate a chart with the top CIs for a given timestamp
  def perf_top_chart
    return if perfmenu_click?
    @record = identify_tl_or_perf_record
    @perf_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    if params[:menu_choice]
      chart_click_data = parse_chart_click(params[:menu_choice])
      report = @sb[:chart_reports].kind_of?(Array) ? @sb[:chart_reports][chart_click_data.chart_index] : @sb[:chart_reports]
      data_row = report.table.data[chart_click_data.data_index]
      if @perf_options[:cat]
        top_ids = data_row["assoc_ids_#{report.extras[:group_by_tags][chart_click_data.legend_index]}"][chart_click_data.model.downcase.to_sym][:on]
      else
        top_ids = data_row["assoc_ids"][chart_click_data.model.downcase.to_sym][:on]
      end
      @perf_options[:top_model] = chart_click_data.model.singularize.capitalize
      @perf_options[:top_type] = chart_click_data.type # day or hour
      @perf_options[:top_ts] = data_row["timestamp"].utc
      @perf_options[:top_ids] = top_ids
    end
    @perf_options[:index] = params[:chart_idx] == "clear" ? nil : params[:chart_idx] if params[:chart_idx]
    @showtype = "performance"
    if request.xml_http_request?  # Is this an Ajax request?
      perf_gen_top_data # Generate top data
      return unless @charts # Return if no charts got created (first time thru async rpt gen)
      render :update do |page|
        page << javascript_prologue
        page << 'ManageIQ.charts.chartData = ' + {"candu" => @chart_data}.to_json + ';'
        page.replace("candu_charts_div",
                     :partial => "layouts/perf_charts",
                     :locals  => {:chart_data => @chart_data, :chart_set => "candu"})
        page << Charting.js_load_statement
        page << 'miqSparkle(false);'
      end
    else
      drop_breadcrumb(:name => params[:bc],
                      :url  => url_for_only_path(:id     => @perf_record.id,
                                       :action => "perf_top_chart",
                                       :bc     => params[:bc],
                                       :escape => false))
      @ajax_action = "perf_top_chart"
      render :action => "show"
    end
  end

  private ############################

  def perf_breadcrumb
    name = @perf_record.respond_to?(:evm_display_name) ? @perf_record.evm_display_name : @perf_record.name
    url = url_for_only_path(:action => "show",
                            :id => @perf_record,
                            :display => "performance",
                            :refresh => "n")
    if @perf_options.cat
      drop_breadcrumb(:name => _("%{name} Capacity & Utilization (by %{option}:%{model})") %
                      {:name => name,
                       :option => @perf_options.cats[@perf_options.cat_model],
                       :model => @perf_options.cat},
                      :url => url)
    else
      drop_breadcrumb(:name => _("%{name} Capacity & Utilization") %
                      {:name => name},
                      :url  => url)
    end
  end

  # Initiate the backend refresh of realtime c&u data
  def perf_refresh_data
    assert_privileges("perf_refresh")
    @record = identify_tl_or_perf_record
    @perf_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    @perf_record.perf_capture_realtime_now
    add_flash(_("Refresh of recent C&U data has been initiated"))
  end

  # Correct any date that is out of the date/range or not allowed in a profile
  def perf_set_or_fix_dates(allow_interval_override = true)
    start_date, end_date = @perf_record.first_and_last_capture('hourly')
    start_date, end_date = @perf_record.first_and_last_capture('realtime') if realtime = start_date.nil?
    if start_date.nil? && realtime
      add_flash(_("No Utilization data available"), :warning)
      @no_util_data = true
      return
    elsif realtime
      @perf_options[:typ] = "realtime"
      @perf_options[:no_rollups] = true
    end
    @perf_options.set_dates(start_date, end_date, allow_interval_override)
  end

  def skip_days_from_time_profile(time_profile_days)
    (1..7).to_a.delete_if do |d|
      # time_profile_days has 0 for sunday, skip_days needs 7 for sunday
      time_profile_days.include?(d % 7)
    end
  end

  # Handle actions for performance chart context menu clicks
  def perf_menu_click
    # Parse the clicked item to get indexes and selection variables
    chart_click_data = parse_chart_click(params[:menu_click])
    # Swap in 'Instances' for 'VMs' in AZ breadcrumbs (poor man's cloud/infra split hack)
    bc_model = ['availability_zone', 'host_aggregate'].include?(request.parameters['controller']) && chart_click_data.model == 'VMs' ? 'Instances' : chart_click_data.model

    report = @sb[:chart_reports].kind_of?(Array) ? @sb[:chart_reports][chart_click_data.chart_index] : @sb[:chart_reports]
    data_row = report.table.data[chart_click_data.data_index]

    ts = data_row["timestamp"].in_time_zone(@perf_options[:tz]) # Grab the timestamp from the row in selected tz

    request_displayed, unavailability_reason = case chart_click_data.cmd
    when "Display"
      if chart_click_data.model == "Current" && chart_click_data.type == "Top"
        display_current_top(chart_click_data, data_row)
      elsif chart_click_data.type == "bytag"
        display_by_tag(chart_click_data, data_row, report, ts, bc_model)
      else
        display_selected(chart_click_data, ts, data_row, bc_model)
      end
    when "Timeline"
      if chart_click_data.model == "Current"
        timeline_current(chart_click_data, ts)
      elsif chart_click_data.model == "Selected"
        timeline_selected(chart_click_data, data_row, ts)
      end
    when "Chart"
      if chart_click_data.model == "Current" && chart_click_data.type == "Hourly"
        chart_current_hourly(ts)
      elsif chart_click_data.model == "Current" && chart_click_data.type == "Daily"
        chart_current_daily
      elsif chart_click_data.model == "Selected"
        chart_selected(chart_click_data, data_row, ts)
      elsif chart_click_data.type.starts_with?("top") && @perf_options[:cat]
        chart_top_by_tag(chart_click_data, data_row, report, ts, bc_model)
      elsif chart_click_data.type.starts_with?("top")
        chart_top(chart_click_data, data_row, ts, bc_model)
      end
    else
      [false, _("Chart menu selection not yet implemented")]
    end

    if request_displayed
      return
    elsif unavailability_reason.present?
      add_flash(unavailability_reason, :warning)
    else
      add_flash(_("Unknown error has occurred"), :error)
    end

    javascript_flash(:spinner_off => true)
  end

  # display the CI selected from a Top chart
  def display_current_top(data_row)
    unless perf_menu_record_valid(data_row["resource_type"], data_row["resource_id"])
      return [true, nil]
    end
    javascript_redirect :controller => data_row["resource_type"].underscore,
                        :action     => "show",
                        :id         => data_row["resource_id"],
                        :escape     => false
    [true, nil]
  end

  # display selected resources from a tag chart
  def display_by_tag(chart_click_data, data_row, report, ts, bc_model)
    top_ids = data_row["assoc_ids_#{report.extras[:group_by_tags][chart_click_data.legend_index]}"][chart_click_data.model.downcase.to_sym][:on]
    bc_tag = breadcrumb_tag(report, chart_click_data.legend_index)
    if top_ids.blank?
      message = _("No %{tag} %{model} were running %{time}") %
        {:tag => bc_tag, :model => bc_model, :time => date_time_running_msg(chart_click_data.type, ts)}
      return [false, message]
    else
      bc = if request.parameters["controller"] == "storage"
             _("%{model} (%{tag} %{time})") %
               {:tag => bc_tag, :model => bc_model, :time => date_time_running_msg(chart_click_data.type, ts)}
           else
             _("%{model} (%{tag} running %{time})") %
               {:tag => bc_tag, :model => bc_model, :time => date_time_running_msg(chart_click_data.type, ts)}
           end
      javascript_redirect :controller    => chart_click_data.model.downcase.singularize,
                          :action        => "show_list",
                          :menu_click    => params[:menu_click],
                          :sb_controller => request.parameters["controller"],
                          :bc            => bc,
                          :escape        => false
      return [true, nil]
    end
  end

  # display selected resources
  def display_selected(chart_click_data, ts, data_row, bc_model)
    dt = @perf_options[:typ] == "Hourly" ? "on #{ts.to_date} at #{ts.strftime("%H:%M:%S %Z")}" : "on #{ts.to_date}"
    state = chart_click_data.type == "on" ? _("running") : _("stopped")
    if data_row["assoc_ids"][chart_click_data.model.downcase.to_sym][chart_click_data.type.to_sym].blank?
      message = _("No %{model} were %{state} %{time}") % {:model => chart_click_data.model, :state => state, :time => dt}
      return [false, message]
    else
      bc = request.parameters["controller"] == "storage" ? "#{bc_model} #{dt}" : "#{bc_model} #{state} #{dt}"
      javascript_redirect :controller    => chart_click_data.model.downcase.singularize,
                          :action        => "show_list",
                          :menu_click    => params[:menu_click],
                          :sb_controller => request.parameters["controller"],
                          :bc            => bc,
                          :escape        => false
      return [true, nil]
    end
  end

  # display timeline for the current CI
  def timeline_current(chart_click_data, ts)
    @record = identify_tl_or_perf_record
    @perf_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    @perf_record = VmOrTemplate.find(@perf_options[:compare_vm]) unless @perf_options[:compare_vm].nil?
    new_opts = tl_session_data(request.parameters["controller"]) || ApplicationController::Timelines::Options.new
    new_opts[:model] = @perf_record.class.base_class.to_s
    new_opts.date.typ = chart_click_data.type
    new_opts.date.daily = @perf_options[:daily_date] if chart_click_data.type == "Daily"
    new_opts.date.hourly = [ts.month, ts.day, ts.year].join("/") if chart_click_data.type == "Hourly"
    new_opts[:tl_show] = "timeline"
    set_tl_session_data(new_opts, request.parameters["controller"])
    f = @perf_record.first_event
    if f.nil?
      message = if new_opts[:model] == "EmsCluster"
                  _("No events available for this Cluster")
                else
                  _("No events available for this %{model}") % {:model => new_opts[:model]}
                end
      return [false, message]
    elsif @record.kind_of?(MiqServer) # For server charts in OPS
      change_tab("diagnostics_timelines") # Switch to the Timelines tab
      return [true, nil]
    else
      if @explorer
        @_params[:id] = @perf_record.id
        @_params[:refresh] = "n"
        show_timeline
      else
        javascript_redirect :id         => @perf_record.id,
                            :action     => "show",
                            :display    => "timeline",
                            :controller => model_to_controller(@perf_record),
                            :refresh    => "n",
                            :escape     => false
      end
      return [true, nil]
    end
  end

  # display timeline for the selected CI
  def timeline_selected(chart_click_data, data_row, ts)
    @record = perf_menu_record_valid(data_row["resource_type"], data_row["resource_id"])
    return [true, nil] unless @record
    controller = data_row["resource_type"].underscore
    new_opts = tl_session_data(controller) || ApplicationController::Timelines::Options.new
    new_opts[:model] = data_row["resource_type"]
    new_opts.date.typ = chart_click_data.type
    new_opts.date.daily = @perf_options[:daily_date] if chart_click_data.type == "Daily"
    new_opts.date.hourly = [ts.month, ts.day, ts.year].join("/") if chart_click_data.type == "Hourly"
    new_opts[:tl_show] = "timeline"
    set_tl_session_data(new_opts, controller)
    f = @record.first_event
    if f.nil?
      message = if chart_click_data.model == "EmsCluster"
                  _("No events available for this Cluster")
                else
                  _("No events available for this %{model}") % {:model => chart_click_data.model}
                end
      return [false, message]
    elsif @record.kind_of?(MiqServer) # For server charts in OPS
      change_tab("diagnostics_timelines") # Switch to the Timelines tab
      return [true, nil]
    else
      if @explorer
        @_params[:id] = data_row["resource_id"]
        @_params[:refresh] = "n"
        show_timeline
      else
        if data_row["resource_type"] == "VmOrTemplate"
          tree_node_id = TreeBuilder.build_node_id(@record.class.base_model, @record.id)
          session[:exp_parms] = {:display => "timeline", :refresh => "n", :id => tree_node_id}
          javascript_redirect :controller => data_row["resource_type"].underscore.downcase.singularize,
                              :action     => "explorer"
        else
          javascript_redirect :controller => data_row["resource_type"].underscore.downcase.singularize,
                              :action     => "show",
                              :display    => "timeline",
                              :id         => data_row["resource_id"],
                              :refresh    => "n",
                              :escape     => false
        end
      end
      return [true, nil]
    end
  end

  # create hourly chart for selected day
  def chart_current_hourly(ts)
    @record = identify_tl_or_perf_record
    @perf_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    @perf_options[:typ] = "Hourly"
    @perf_options[:hourly_date] = [ts.month, ts.day, ts.year].join("/")

    perf_set_or_fix_dates unless params[:task_id] # Set dates if first time thru
    perf_gen_data

    return [true, nil] unless @charts # Return if no charts got created (first time thru async rpt gen)

    render :update do |page|
      page << javascript_prologue
      if @parent_chart_data
        page << 'ManageIQ.charts.chartData = ' + {
          "candu"  => @chart_data,
          "parent" => @parent_chart_data
        }.to_json + ';'
      elsif @parent_chart_data
        page << 'ManageIQ.charts.chartData = ' + {
          "candu"      => @chart_data,
          "compare_vm" => @compare_vm_chart_data
        }.to_json + ';'
      else
        page << 'ManageIQ.charts.chartData = ' + {
          "candu" => @chart_data
        }.to_json + ';'
      end
      page.replace("perf_options_div", :partial => "layouts/perf_options")
      page.replace("candu_charts_div", :partial => "layouts/perf_charts", :locals => {:chart_data => @chart_data, :chart_set => "candu"})
      page << js_build_calendar(@perf_options.to_calendar)
      page << Charting.js_load_statement
      page << 'miqSparkle(false);'
    end
    [true, nil]
  end

  # go back to the daily chart
  def chart_current_daily
    @record = identify_tl_or_perf_record
    @perf_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    @perf_options[:typ] = "Daily"
    perf_set_or_fix_dates(false) unless params[:task_id] # Set dates if first time thru
    perf_gen_data
    return [true, nil] unless @charts # Return if no charts got created (first time thru async rpt gen)

    render :update do |page|
      page << javascript_prologue
      if @parent_chart_data
        page << 'ManageIQ.charts.chartData = ' + {
          "candu"  => @chart_data,
          "parent" => @parent_chart_data
        }.to_json + ';'
      else
        page << 'ManageIQ.charts.chartData = ' + {
          "candu" => @chart_data
        }.to_json + ';'
      end
      page.replace("perf_options_div", :partial => "layouts/perf_options")
      page.replace("candu_charts_div", :partial => "layouts/perf_charts", :locals => {:chart_data => @chart_data, :chart_set => "candu"})
      page << js_build_calendar(@perf_options.to_calendar)
      page << Charting.js_load_statement
      page << 'miqSparkle(false);'
    end
    [true, nil]
  end

  # Create daily/hourly chart for selected CI
  def chart_selected(chart_click_data, data_row, ts)
    @record = perf_menu_record_valid(data_row["resource_type"], data_row["resource_id"])
    return [true, nil] unless @record
    # Set the perf options in the selected controller's sandbox
    cont = data_row["resource_type"].underscore.downcase.to_sym
    session[:sandboxes][cont] ||= {}
    session[:sandboxes][cont][:perf_options] ||= Options.new

    # Copy general items from the current perf_options
    session[:sandboxes][cont][:perf_options][:index] = @perf_options[:index]
    session[:sandboxes][cont][:perf_options][:tz] = @perf_options[:tz]
    session[:sandboxes][cont][:perf_options][:time_profile] = @perf_options[:time_profile]
    session[:sandboxes][cont][:perf_options][:time_profile_days] = @perf_options[:time_profile_days]
    session[:sandboxes][cont][:perf_options][:time_profile_tz] = @perf_options[:time_profile_tz]

    # Set new perf options based on what was selected
    session[:sandboxes][cont][:perf_options][:model] = data_row["resource_type"]
    session[:sandboxes][cont][:perf_options][:typ] = chart_click_data.type
    session[:sandboxes][cont][:perf_options][:daily_date] = @perf_options[:daily_date] if chart_click_data.type == "Daily"
    session[:sandboxes][cont][:perf_options][:days] = @perf_options[:days] if chart_click_data.type == "Daily"
    session[:sandboxes][cont][:perf_options][:hourly_date] = [ts.month, ts.day, ts.year].join("/") if chart_click_data.type == "Hourly"

    if data_row["resource_type"] == "VmOrTemplate"
      prefix = TreeBuilder.get_prefix_for_model(@record.class.base_model)
      tree_node_id = "#{prefix}-#{@record.id}"  # Build the tree node id
      session[:exp_parms] = {:display => "performance", :refresh => "n", :id => tree_node_id}
      javascript_redirect :controller => data_row["resource_type"].underscore.downcase.singularize,
                          :action     => "explorer"
    else
      javascript_redirect :controller => data_row["resource_type"].underscore.downcase.singularize,
                          :action     => "show",
                          :id         => data_row["resource_id"],
                          :display    => "performance",
                          :refresh    => "n",
                          :escape     => false
    end
    [true, nil]
  end

  # create top chart for selected timestamp/model by tag
  def chart_top_by_tag(chart_click_data, data_row, report, ts, bc_model)
    @record = identify_tl_or_perf_record
    @perf_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    top_ids = data_row["assoc_ids_#{report.extras[:group_by_tags][chart_click_data.legend_index]}"][chart_click_data.model.downcase.to_sym][:on]
    bc_tag = breadcrumb_tag(report, chart_click_data.legend_index)
    if top_ids.blank?
      message = _("No %{tag} %{model}  were running %{time}") %
                          {:tag => bc_tag, :model => bc_model, :time => date_time_running_msg(chart_click_data.type, ts)}
      return [false, message]
    else
      javascript_redirect :id          => @perf_record.id,
                          :action      => "perf_top_chart",
                          :menu_choice => params[:menu_click],
                          :bc          => "#{@perf_record.name} top #{bc_model} (#{bc_tag} #{date_time_running_msg(chart_click_data.type, ts)})",
                          :escape      => false
      return [true, nil]
    end
  end

  # create top chart for selected timestamp/model
  def chart_top(chart_click_data, data_row, ts, bc_model)
    @record = identify_tl_or_perf_record
    @perf_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    top_ids = data_row["assoc_ids"][chart_click_data.model.downcase.to_sym][:on]
    if top_ids.blank?
      message = _("No %{model} were running %{time}") %
        {:model => chart_click_data.model, :time => date_time_running_msg(chart_click_data.type, ts)}
      return [false, message]
    else
      javascript_redirect :id          => @perf_record.id,
                          :action      => "perf_top_chart",
                          :menu_choice => params[:menu_click],
                          :bc          => "#{@perf_record.name} top #{bc_model} (#{date_time_running_msg(chart_click_data.type, ts)})",
                          :escape      => false
      return [true, nil]
    end
  end

  def date_time_running_msg(typ, timestamp)
    if typ == "tophour"
      _("on %{date} at %{time}") %
        {:date => timestamp.to_date,
         :time => timestamp.strftime("%h:%m:%s %z")}
    else
      _("on %{date}") % {:date => timestamp.to_date}
    end
  end

  # Send error message if record is found and authorized, else return the record
  def perf_menu_record_valid(model, id)
    record = find_record_with_rbac(model.constantize, id)
    if record.present?
      add_flash(_("Can't access selected record"))
    end
    unless @flash_array.blank?
      javascript_flash(:spinner_off => true)
      return false
    end
    record # Record is found and authorized
  end

  # Load a chart miq_report object from YML
  def perf_get_chart_rpt(chart_rpt)
    MiqReport.new(YAML.load(File.open("#{CHARTS_REPORTS_FOLDER}/#{chart_rpt}.yaml")))
  end

  # Load a chart layout from YML
  def perf_get_chart_layout(layout, fname = nil)
    charts = ChartsLayoutService.layout(@perf_record, CHARTS_LAYOUTS_FOLDER, layout, fname)
    @perf_options[:index] = nil unless @perf_options[:index].nil? || charts[@perf_options[:index].to_i]
    charts
  end

  # Init options for performance charts
  def perf_gen_init_options(refresh = nil)
    @perf_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    unless refresh == "n" || params[:refresh] == "n"
      @perf_options = Options.new
      tzs = TimeProfile.rollup_daily_metrics.all_timezones
      @perf_options[:tz_daily] = tzs.include?(session[:user_tz]) ? session[:user_tz] : tzs.first
      @perf_options[:typ] = "Daily"
      # TODO: Remove next line once daily is available for Vmdb tables
      @perf_options[:typ] = "Hourly" if @perf_record.class.name.starts_with?("Vmdb")
      @perf_options[:days] = "7"
      @perf_options[:rt_minutes] = 15.minutes
      @perf_options[:model] = @perf_record.class.base_class.to_s
    end
    @perf_options[:rt_minutes] ||= 15.minutes
    get_time_profiles(@perf_record) # Get time profiles list (global and user specific). Pass record so that profiles can be limited to its region.
    # Get the time zone from the time profile, if one is in use
    if @perf_options[:time_profile]
      tp = TimeProfile.find_by_id(@perf_options[:time_profile])
      set_time_profile_vars(tp, @perf_options)
    else
      set_time_profile_vars(selected_time_profile_for_pull_down, @perf_options)
    end

    # Get start/end dates in selected timezone, but only right before displaying the chart options screen
    perf_set_or_fix_dates if params[:action] == "perf_chart_chooser"

    @perf_options[:days] ||= "7"
    @perf_options[:ght_type] ||= "hybrid"
    @perf_options[:chart_type] = :performance

    perf_breadcrumb
    @ajax_action = "perf_chart_chooser"
  end

  # Generate performance data for a model's charts
  def perf_gen_data
    perf_breadcrumb
    unless @perf_options[:typ] == "realtime"
      if @perf_options[:cat] # If a category was chosen, generate charts by tag
        perf_gen_tag_data
        return
      end
    end
    # First time thru, kick off the report generate task
    params[:task_id] ? perf_gen_data_after_wait : perf_gen_data_before_wait
  end

  # Generate performance data for a model's charts - kick off report task
  def perf_gen_data_before_wait
    interval_type = @perf_options[:typ].downcase
    case interval_type
    when "hourly", "daily"

      # Set from/to datetimes
      if interval_type == "hourly"
        from_dt = create_time_in_utc(@perf_options[:hourly_date] + " 00", @perf_options[:tz]) # Get tz 12am in UTC
        to_dt = create_time_in_utc(@perf_options[:hourly_date] + " 23", @perf_options[:tz])   # Get tz 11pm in UTC
      elsif interval_type == "daily"
        f = Date.parse(@perf_options[:daily_date]) - (@perf_options[:days].to_i - 1)
        st = @perf_options[:sdate_daily]
        s = Date.parse("#{st.year}/#{st.month}/#{st.day}")
        f = s if f < s                                      # Use later date
        from_dt = create_time_in_utc("#{f.year}/#{f.month}/#{f.day} 00", @perf_options[:tz])  # Get tz 12am in UTC
        to_dt = create_time_in_utc("#{@perf_options[:daily_date]} 23", @perf_options[:tz])    # Get tz 11pm in UTC
      end

      # Get the report definition (yaml) and set the where clause based on the record type
      if @perf_record.kind_of?(VmdbDatabase)
        rpt = perf_get_chart_rpt(@perf_options[:model].underscore)
        rpt.where_clause =  ["vmdb_database_id = ? and timestamp >= ? and timestamp <= ? and capture_interval_name = ?",
                             @perf_record.id,
                             from_dt,
                             to_dt,
                             interval_type]
      elsif @perf_record.kind_of?(VmdbTable)
        rpt = perf_get_chart_rpt(@perf_options[:model].underscore)
        rpt.where_clause =  ["resource_type = ? and resource_id = ? and timestamp >= ? and timestamp <= ? and capture_interval_name = ?",
                             @perf_options[:model],
                             @perf_record.id,
                             from_dt,
                             to_dt,
                             interval_type]
      elsif %w(MiddlewareServer MiddlewareDatasource MiddlewareMessaging).include?(@perf_record.class.name.demodulize)
        rpt = perf_get_chart_rpt("vim_perf_#{interval_type}_#{@perf_record.chart_report_name}")
        rpt.where_clause = ["resource_type = ? and resource_id = ? and timestamp >= ? and timestamp <= ? " \
                            "and capture_interval_name = ?",
                            @perf_options[:model],
                            @perf_record.id,
                            from_dt,
                            to_dt,
                            interval_type]
      else  # Doing VIM performance on a normal CI
        suffix = (@perf_record.kind_of?(AvailabilityZone) || @perf_record.kind_of?(HostAggregate)) ? "_cloud" : "" # Get special cloud version with 'Instances' headers
        rpt = perf_get_chart_rpt("vim_perf_#{interval_type}#{suffix}")
        rpt.where_clause =  ["resource_type = ? and resource_id = ? and timestamp >= ? and timestamp <= ? and capture_interval_name = ?",
                             @perf_options[:model],
                             @perf_record.id,
                             from_dt,
                             to_dt,
                             interval_type]
      end
      rpt.tz = @perf_options[:tz]
      rpt.time_profile_id = @perf_options[:time_profile]

    when "realtime"
      f, to_dt = @perf_record.first_and_last_capture("realtime")
      from_dt = to_dt.nil? ? nil : to_dt - @perf_options[:rt_minutes]
      suffix = if %w(MiddlewareServer MiddlewareDatasource MiddlewareMessaging)
                  .include?(@perf_record.class.name.demodulize)
                 "_#{@perf_record.chart_report_name}"
               else
                 ""
               end
      rpt = perf_get_chart_rpt("vim_perf_realtime#{suffix}")
      rpt.tz = @perf_options[:tz]
      rpt.extras = Hash.new
      rpt.extras[:realtime] = true
      @perf_options[:range] = if to_dt.nil?
                                nil
                              else
                                _("%{date_from} to %{date_to}") %
                                  {:date_from => format_timezone(from_dt, @perf_options[:tz], "gtl"),
                                   :date_to   => format_timezone(to_dt, @perf_options[:tz], "gtl")}
                              end
      rpt.where_clause =  ["resource_type = ? and resource_id = ? and timestamp >= ? and timestamp <= ? and capture_interval_name = ?",
                           @perf_options[:model],
                           @perf_record.id,
                           from_dt,
                           to_dt,
                           "realtime"]
    end
    rpts = [rpt]
    if perf_parent?                               # Build the parent report, if asked for
      p_rpt = Marshal.load(Marshal.dump(rpt))    # Deep clone the main report
      p_rpt.where_clause[1] = @perf_options[:parent]
      p_rpt.where_clause[2] = @perf_record.send(VALID_PERF_PARENTS[@perf_options[:parent]]).id
      rpts.push(p_rpt)
    end

    initiate_wait_for_task(:task_id => MiqReport.async_generate_tables(:reports => rpts, :userid => session[:userid]))
  end

  # Generate performance data for a model's charts - generate charts from report task results
  def perf_gen_data_after_wait
    miq_task = MiqTask.find(params[:task_id])     # Not first time, read the task record
    rpt = miq_task.task_results.first             # Grab the only report in the array of reports returned
    p_rpt = miq_task.task_results[1] if perf_parent?  # Grab the parent report in the array of reports returned
    miq_task.destroy                              # Get rid of the task and results

    @charts, @chart_data = perf_gen_charts(rpt, @perf_options)
    if perf_parent?
      @parent_charts, @parent_chart_data = perf_gen_charts(p_rpt, @perf_options, true)
    end

    @sb[:chart_reports] = rpt           # Hang on to the report data for these charts

    @html = perf_report_to_html
    @p_html = perf_report_to_html(p_rpt, @parent_charts[0]) if perf_parent?
  end

  # Return the column in the chart that starts with "trend_"
  def perf_get_chart_trendcol(chart)
    chart[:columns].each do |c|
      return c if c.starts_with?("trend_")
    end
    nil
  end

  # Remove columns from chart based on model and/or options
  def perf_remove_chart_cols(chart)
    if @perf_options[:model] == "Host" && !@perf_record.owning_cluster.nil?
      chart[:columns].delete_if { |col| col.include?("reserved") }
      chart[:trends].delete_if { |trend| trend.include?("reserved") } if chart[:trends]
    end
    if chart[:title].include?("by Type") && @perf_options[:vmtype] && @perf_options[:vmtype] != "<All>"
      chart[:columns].delete_if do |col|
        !col.include?("_" + @perf_options[:vmtype])
      end
    end
  end

  # Generate performance data by tag for a model's charts
  def perf_gen_tag_data
    @perf_options[:chart_type] = :performance
    # First time thru, kick off the report generate task
    params[:task_id] ? perf_gen_tag_data_after_wait : perf_gen_tag_data_before_wait
  end

  # Generate performance data by tag - kick off report task
  def perf_gen_tag_data_before_wait
    case @perf_options[:typ]
    when "Hourly"
      from_dt = create_time_in_utc(@perf_options[:hourly_date] + " 00:00:00", @perf_options[:tz]) # Get tz 12am in UTC
      to_dt = create_time_in_utc(@perf_options[:hourly_date] + " 23:59:59", @perf_options[:tz])   # Get tz 11:59pm in UTC
      rpt = perf_get_chart_rpt("vim_perf_tag_hourly")
      rpt.performance = {:group_by_category => @perf_options[:cat]}
      rpt.tz = @perf_options[:tz]
      rpt.time_profile_id = @perf_options[:time_profile]
      rpt.where_clause =  ["resource_type = ? and resource_id = ? and timestamp >= ? and timestamp <= ? and capture_interval_name = ?",
                           @perf_record.class.base_class.name,
                           @perf_record.id,
                           from_dt,
                           to_dt,
                           'hourly']
    when "Daily"
      f = Date.parse(@perf_options[:daily_date]) - (@perf_options[:days].to_i - 1)
      from_dt = create_time_in_utc("#{f.year}/#{f.month}/#{f.day} 00", @perf_options[:tz])  # Get tz 12am in UTC
      to_dt = create_time_in_utc("#{@perf_options[:daily_date]} 23", @perf_options[:tz])    # Get tz 11pm in UTC
      rpt = perf_get_chart_rpt("vim_perf_tag_daily")
      rpt.time_profile_id = @perf_options[:time_profile]
      chart_layout = perf_get_chart_layout("daily_tag_charts", @perf_options[:model]) if @perf_options[:index]
      if @perf_options[:index]                    # If only looking at 1 chart, trim report columns for less daily rollups
        chart = chart_layout[@perf_options[:index].to_i]
        perf_trim_report_cols(rpt, chart)
      end
      rpt.tz = @perf_options[:tz]
      rpt.performance = {:group_by_category => @perf_options[:cat]}
      rpt.where_clause =  ["resource_type = ? and resource_id = ? and timestamp >= ? and timestamp <= ?",
                           @perf_record.class.base_class.name,
                           @perf_record.id,
                           from_dt,
                           to_dt]
    end
    initiate_wait_for_task(:task_id => rpt.async_generate_table(
      :userid     => session[:userid],
      :session_id => request.session_options[:id],
      :cat_model  => @perf_options[:cat_model],
      :mode       => "charts")
                          )
  end

  def prepare_perf_tag_chart(chart, rpt, cat_desc)
    # Remove opposite menu items
    chart[:menu].delete_if { |m| m.include?(@perf_options[:cat_model] == "Host" ? "VMs for" : "Hosts for") }
    # Substitue category description + ':<series>' into menus
    chart[:menu].each { |m| m.gsub!(/<cat>/, cat_desc + " <series>") }
    # Grab the first (and should be only) chart column
    col = chart[:columns].first
    # Create the new chart columns for each tag
    chart[:columns] = rpt.extras[:group_by_tags].collect { |t| col + "_" + t }
  end

  def gen_perf_chart(chart, rpt, idx, zoom_action)
    options = chart.merge(
      :zoom_url      => zoom_url = perf_zoom_url(zoom_action, idx.nil? ? 'clear' : idx.to_s),
      :link_data_url => "javascript:miqChartLinkData( _col_, _row_, _value_, _category_, _series_, _id_ )",
      :axis_skip     => 3
    )
    options.merge!(:width => 1000, :height => 700) if idx.nil?

    process_chart_trends(chart, rpt, options)

    generated_chart = perf_gen_chart(rpt, options).merge(:menu => chart[:menu], :zoom_url => zoom_url)

    # Grab title from chart in case formatting added units
    chart[:title] = rpt.title

    generated_chart
  end

  # Generate performance data by tag - generate charts from report task results
  def perf_gen_tag_data_after_wait
    miq_task = MiqTask.find(params[:task_id])       # Not first time, read the task record
    rpt = miq_task.miq_report_result.report_results # Grab the report object from the blob
    miq_task.destroy                                # Get rid of the task and results

    charts = []
    chart_data = []
    cat_desc = Classification.find_by_name(@perf_options[:cat]).description

    layout_name = case @perf_options[:typ]
                  when "Hourly" then 'hourly_tag_charts'
                  when "Daily"  then 'daily_tag_charts'
                  end

    chart_layout = perf_get_chart_layout(layout_name, @perf_options[:model])

    if @perf_options[:index]
      chart_index = @perf_options[:index].to_i
      chart = chart_layout[chart_index]
      prepare_perf_tag_chart(chart, rpt, cat_desc)
      chart_data.push(gen_perf_chart(chart, rpt, nil, 'perf_chart_chooser'))
      charts.push(chart)
    else
      chart_layout.each_with_index do |chart, idx|
        prepare_perf_tag_chart(chart, rpt, cat_desc)
        chart_data.push(gen_perf_chart(chart, rpt, idx, 'perf_chart_chooser'))
        charts.push(chart)
      end
    end

    @sb[:chart_reports] = rpt # Hang on to the report data for these charts
    @chart_data = chart_data
    @charts     = charts
    @html       = perf_report_to_html
  end

  # Generate top 10 chart data
  def perf_gen_top_data
    unless params[:task_id]                       # First time thru, kick off the report generate task
      perf_gen_top_data_before_wait
    else
      perf_gen_top_data_after_wait
    end
  end

  # Generate top 10 chart data - kick off report task
  def perf_gen_top_data_before_wait
    @perf_options[:ght_type] ||= "hybrid"
    @perf_options[:chart_type] = :performance
    cont_plus_model = request.parameters["controller"] + "-" + @perf_options[:top_model]
    metric_model = @perf_options[:top_model] == "Vm" ? "VmOrTemplate" : @perf_options[:top_model]
    rpts = []                            # Store all reports for the async task to work on
    case @perf_options[:top_type]
    when "topday"
      chart_layout = perf_get_chart_layout("day_top_charts", cont_plus_model)
      unless @perf_options[:index]              # Gen all charts if no index present
        chart_layout.each_with_index do |chart, _idx|
          next if chart.nil?
          rpt = perf_get_chart_rpt("vim_perf_topday")
          rpt.tz = @perf_options[:tz]
          rpt.time_profile_id = @perf_options[:time_profile]
          rpt.where_clause = ["resource_type = ? and resource_id IN (?) and timestamp >= ? and timestamp < ?",
                              metric_model,
                              @perf_options[:top_ids],
                              @perf_options[:top_ts].utc,
                              @perf_options[:top_ts].utc + 1.day]
          rpts.push(rpt)
        end
      else                                      # Gen chart based on index
        rpt = perf_get_chart_rpt("vim_perf_topday")
        rpt.tz = @perf_options[:tz]
        rpt.time_profile_id = @perf_options[:time_profile]
        rpt.where_clause = ["resource_type = ? and resource_id IN (?) and timestamp >= ? and timestamp < ?",
                            metric_model,
                            @perf_options[:top_ids],
                            @perf_options[:top_ts].utc,
                            @perf_options[:top_ts].utc + 1.day]
        rpts.push(rpt)
      end
    when "tophour"
      chart_layout = perf_get_chart_layout("hour_top_charts", cont_plus_model)
      unless @perf_options[:index]            # Gen all charts if no index present
        chart_layout.each_with_index do |chart, _idx|
          next if chart.nil?
          rpt = perf_get_chart_rpt("vim_perf_tophour")
          rpt.tz = @perf_options[:tz]
          rpt.time_profile_id = @perf_options[:time_profile]
          rpt.where_clause = ["resource_type = ? and resource_id IN (?) and timestamp = ? and capture_interval_name = ?",
                              metric_model,
                              @perf_options[:top_ids],
                              @perf_options[:top_ts].utc,
                              'hourly']
          rpts.push(rpt)
        end
      else                                    # Gen chart based on index
        rpt = perf_get_chart_rpt("vim_perf_tophour")
        rpt.tz = @perf_options[:tz]
        rpt.time_profile_id = @perf_options[:time_profile]
        rpt.where_clause = ["resource_type = ? and resource_id IN (?) and timestamp = ? and capture_interval_name = ?",
                            metric_model,
                            @perf_options[:top_ids],
                            @perf_options[:top_ts].utc,
                            'hourly']
        rpts.push(rpt)
      end
    end
    if rpts.length == 1
      initiate_wait_for_task(:task_id => rpts.first.async_generate_table(
        :userid     => session[:userid],
        :session_id => request.session_options[:id],
        :mode       => "charts"))
    else
      initiate_wait_for_task(:task_id => MiqReport.async_generate_tables(:reports => rpts, :userid => session[:userid]))
    end
  end

  # Generate top 10 chart data - generate charts from report task results
  def perf_gen_top_data_after_wait
    miq_task = MiqTask.find(params[:task_id])     # Not first time, read the task record
    if miq_task.task_results.kind_of?(Array)
      rpts = miq_task.task_results.reverse        # Grab the array of report objects (reversed so reports can be popped off)
    else
      rpt = miq_task.miq_report_result.report_results # Grab the report object from the blob
    end
    miq_task.destroy                              # Get rid of the task and results

    @chart_reports = []
    @charts = []
    @chart_data = []

    @perf_options[:ght_type] ||= "hybrid"
    @perf_options[:chart_type] = :performance
    cont_plus_model = request.parameters["controller"] + "-" + @perf_options[:top_model]

    layout_name = case @perf_options[:top_type]
                  when 'topday'  then 'day_top_charts'
                  when 'tophour' then 'hour_top_charts'
                  end
    chart_layouts = perf_get_chart_layout(layout_name, cont_plus_model)

    if @perf_options[:index]
      chart_index = @perf_options[:index].to_i
      chart = chart_layouts[chart_index]
      @chart_data.push(gen_perf_chart(chart, rpt, nil, 'perf_top_chart'))
      @chart_reports.push(rpt)
      @charts.push(chart)
    else
      chart_layouts.each_with_index do |chart, idx|
        next if chart.nil?
        rpt = rpts.pop # Get the next report object from the array
        @chart_data.push(gen_perf_chart(chart, rpt, idx, 'perf_top_chart'))
        @chart_reports.push(rpt)
        @charts.push(chart)
      end
    end

    @sb[:chart_reports] = @chart_reports # Hang on to the reports for these charts
    @charts = @charts
    @chart_data = @chart_data
    @top_chart = true
    @html = perf_report_to_html(rpt)
  end

  # Generate daily utilization data for a model's charts
  def perf_util_daily_gen_data(_refresh = nil)
    @perf_record ||= @record
    @sb[:util][:summary] = nil                            # Clear out existing summary report
    @sb[:util][:trend_charts] = nil                       # Clear out the charts to be generated

    # Get start/end dates in selected timezone
    s, e = @perf_record.first_and_last_capture
    return if s.nil?                                      # Nothing to do if no util data
    sdate = s.in_time_zone(@sb[:util][:options][:tz])
    edate = e.in_time_zone(@sb[:util][:options][:tz])
    # Eliminate partial start or end days
    sdate = sdate.hour == 00 ? sdate : sdate + 1.day
    edate = edate.hour < 23 ? edate - 1.day : edate
    return if sdate > edate                               # Don't have a full day's data

    charts = []
    chart_data = []
    chart_layouts = perf_get_chart_layout("daily_util_charts")
    if params[:miq_date_1] || params[:miq_date_2] # Only changed date for the timestamp charts, no need to rebuild the report object
      rpt = @sb[:util][:trend_rpt]
    else
      unless params[:task_id]                       # First time thru, generate report async
        rpt = perf_get_chart_rpt("vim_perf_util_daily")
        rpt.tz = @sb[:util][:options][:tz]
        rpt.time_profile_id = @sb[:util][:options][:time_profile]
        from = Date.parse(@sb[:util][:options][:chart_date]) - (@sb[:util][:options][:days].to_i - 1)
        mm, dd, yy = @sb[:util][:options][:chart_date].split("/")

        rpt.db_options = Hash.new
        rpt.db_options[:rpt_type] = "utilization"
        rpt.db_options[:interval] = "daily"
        rpt.db_options[:start_date] = @sb[:util][:options][:trend_start]        # Midnight on start day
        rpt.db_options[:end_date] = @sb[:util][:options][:trend_end]            # 11pm on end day
        rpt.db_options[:resource_type] = @perf_record.class.base_class.to_s
        rpt.db_options[:resource_id] = @perf_record.id
        rpt.db_options[:tag] = @sb[:util][:options][:tag]

        initiate_wait_for_task(:task_id => rpt.async_generate_table(
          :userid     => session[:userid],
          :session_id => request.session_options[:id],
          :mode       => "charts"))
        @waiting = true
        return
      end
    end

    if params[:task_id]                             # Came in after async report generation
      miq_task = MiqTask.find(params[:task_id])     # Not first time, read the task record
      begin
        unless miq_task.results_ready?
          add_flash(_("Error while generating report: %{error_message}") % {:error_message => miq_task.message}, :error)
          return
        end
        rpt = miq_task.miq_report_result.report_results # Grab the report object from the blob
      ensure
        miq_task.destroy # Get rid of the task and results
      end
    end
    unless @sb[:util][:options][:index]
      chart_layouts[@sb[:util][:options][:model].to_sym].each_with_index do |chart, _idx|
        tag_class = @sb[:util][:options][:tag].split("/").first if @sb[:util][:options][:tag]
        if chart[:type] == "None" || # No chart is available for this slot
           (@sb[:util][:options][:tag] && chart[:allowed_child_tag] && !chart[:allowed_child_tag].include?(tag_class)) # Tag not allowed
          chart_data.push(nil)              # Push a placeholder onto the chart data array
        else
          perf_remove_chart_cols(chart)
          options = chart.merge(:axis_skip => 3)
          options[:chart_type] = chart[:chart_type].to_sym if chart[:chart_type]  # Override :summary chart type if specified in chart definition
          options[:chart_date] = @sb[:util][:options][:chart_date]
          chart_data.push(perf_gen_chart(rpt, options).merge(:menu => chart[:menu]))
          chart[:title] = rpt.title           # Grab title from chart in case formatting added units
        end
        charts.push(chart)
      end
    else
      chart = chart_layouts[@sb[:util][:options][:model].to_sym][@sb[:util][:options][:index].to_i]
      perf_remove_chart_cols(chart)
      options = chart.merge(:axis_skip => 3)
      options[:chart_type] = chart[:chart_type].to_sym if chart[:chart_type]  # Override :summary chart type if specified in chart definition
      options[:chart_date] = @sb[:util][:options][:chart_date]
      chart_data.push(perf_gen_chart(rpt, options).merge(:menu => chart[:menu]))
      chart[:title] = rpt.title               # Grab title from chart in case formatting added units
      charts.push(chart)
    end
    @sb[:util][:trend_rpt] = rpt                  # Hang on to the report data for the trend charts
    @sb[:util][:trend_charts] = charts
    @sb[:util][:chart_data] = {}
    @sb[:util][:chart_data]["utiltrend"] = chart_data

    # Generate the report and chart for the selected trend row (single day chart)
    ts_rpt = perf_get_chart_rpt("vim_perf_util_4_ts")
    tz = @sb[:util][:options][:time_profile_tz] || @sb[:util][:options][:tz]  # Use tz in time profile or chosen tz, if no profile tz
    ts_rpt.db_options = {:report => rpt, :row_col => "timestamp", :row_val => create_time_in_tz(@sb[:util][:options][:chart_date] + " 00", tz)}
    ts_rpt.generate_table(:userid => session[:userid])
    @sb[:util][:ts_rpt] = ts_rpt                # Hang on to the timestamp report data
    ts_chart_layouts = perf_get_chart_layout("ts_util_charts")
    ts_chart = ts_chart_layouts[:MiqReport][0]  # For now, just use first chart
    @sb[:util][:ts_charts] = [ts_chart]         # Hang on to chart (as an array)
    ts_options = ts_chart
    ts_options[:chart_type] = ts_chart[:chart_type].to_sym if ts_chart[:chart_type] # Override chart type if specified in chart definition
    ts_chart_data = [perf_gen_chart(ts_rpt, ts_options)]
    @sb[:util][:chart_data]["utilts"] = ts_chart_data # Hang on to chart data

    @html = perf_report_to_html(rpt)            # Generate html version of the report
    @sb[:util][:summary] = perf_util_summary_info
  end

  # Generate performance vm planning data
  def perf_planning_gen_data(refresh = nil)
    @perf_record = MiqEnterprise.first

    unless params[:task_id] || params[:display_vms]     # First time thru, generate report async
      unless (refresh == "n" || params[:refresh] == "n") && @sb[:planning][:options] && @sb[:planning][:options][:model] == @perf_record.class.base_class.to_s
        @sb[:planning][:options] ||= {}
        @sb[:planning][:options][:typ] = "Daily"
        @sb[:planning][:options][:days] ||= "30"
        @sb[:planning][:options][:model] = "VimPerformancePlanning"
        @sb[:planning][:options][:record_id] = @perf_record.id
      end
      @sb[:planning][:options][:trend_end] = perf_planning_end_date
      @sb[:planning][:options][:days] ||= "30"
      @sb[:planning][:options][:ght_type] ||= "hybrid"
      @sb[:planning][:options][:chart_type] = :summary
      @sb[:planning][:rpt] = nil                  # Clear existing planning report
      rpt = perf_get_chart_rpt("vim_perf_planning")

      rpt.headers[0] = "#{ui_lookup(:model => @sb[:planning][:options][:target_typ])} Name"
      rpt.db_options = Hash.new
      rpt.db_options[:rpt_type] = "planning"
      # Set the default planning options
      rpt.db_options[:options] = {:vm_options => VimPerformancePlanning.vm_default_options(@sb[:planning][:options][:vm_mode])}

      if @sb[:planning][:options][:vm_mode] == :manual  # Set the manually entered values
        @sb[:planning][:options][:values].each do |k, v|
          if k.to_sym == :storage
            rpt.db_options[:options][:vm_options][k.to_sym][:value] = v * 1.gigabyte
          else
            rpt.db_options[:options][:vm_options][k.to_sym][:value] = v
          end
        end
      end

      rpt.db_options[:options][:vm] = @sb[:planning][:options][:chosen_vm] ? @sb[:planning][:options][:chosen_vm].to_i : nil

      rpt.db_options[:options][:range] = {
        :days     => @sb[:planning][:options][:days],
        :end_date => @sb[:planning][:options][:trend_end]
      }

      rpt.db_options[:options][:target_tags] = {:compute_type => @sb[:planning][:options][:target_typ].to_sym}
      rpt.db_options[:options][:target_tags][:compute_filter] = @sb[:planning][:options][:target_filter] if @sb[:planning][:options][:target_filter]

      rpt.db_options[:options][:target_options] = {}
      if @sb[:planning][:options][:trend_cpu]
        rpt.db_options[:options][:target_options][:cpu] = {
          :mode      => :perf_trend,
          :metric    => :max_cpu_usagemhz_rate_average,
          :limit_col => :derived_cpu_available,
          :limit_pct => @sb[:planning][:options][:limit_cpu]
        }
      end
      if @sb[:planning][:options][:trend_memory]
        rpt.db_options[:options][:target_options][:memory] = {
          :mode      => :perf_trend,
          :metric    => :max_derived_memory_used,
          :limit_col => :derived_memory_available,
          :limit_pct => @sb[:planning][:options][:limit_memory]
        }
      end
      if @sb[:planning][:options][:trend_storage]
        rpt.db_options[:options][:target_options][:storage] = {
          :mode      => :current,
          :metric    => :used_space,
          :limit_col => :total_space,
          :limit_pct => @sb[:planning][:options][:limit_storage]
        }
      end
      if @sb[:planning][:options][:trend_vcpus]
        rpt.db_options[:options][:target_options][:vcpus] = {
          :mode        => :current,
          :limit_col   => :total_vcpus, # not sure of name, but should be # vcpus/core times # of cores
          :limit_ratio => @sb[:planning][:options][:limit_vcpus]
        }
      end
      rpt.tz = @sb[:planning][:options][:tz]
      rpt.time_profile_id = @sb[:planning][:options][:time_profile]

      # Remove columns not checked in options
      [:cpu, :vcpus, :memory, :storage].each do |k|
        if @sb[:planning][:vm_opts][k].nil? || !@sb[:planning][:options]["trend_#{k}".to_sym]
          i = rpt.col_order.index("#{k}_vm_count")
          rpt.col_order.delete_at(i)
          rpt.headers.delete_at(i)
        end
      end

      initiate_wait_for_task(:task_id => rpt.async_generate_table(
        :userid     => session[:userid],
        :session_id => request.session_options[:id],
        :mode       => "charts"))
      return
    end

    charts = []
    chart_data = []
    chart_layouts = perf_get_chart_layout("planning_charts")

    # Remove columns not checked in options
    [:cpu, :vcpus, :memory, :storage].each do |k|
      if @sb[:planning][:vm_opts][k].nil? || !@sb[:planning][:options]["trend_#{k == :storage ? "disk" : k.to_s}".to_sym]
        chart_layouts[:VimPerformancePlanning].first[:columns].delete_if { |col| col == "#{k}_vm_count" }
      end
    end

    if params.key?(:display_vms)                # Only changed date for the timestamp charts, no need to rebuild the report object
      rpt = @sb[:planning][:rpt]
    elsif params[:task_id]                          # Came in after async report generation
      miq_task = MiqTask.find(params[:task_id])     # Not first time, read the task record
      rpt = miq_task.miq_report_result.report_results # Grab the report object from the blob
      miq_task.destroy                              # Get rid of the task and results
    end
    @sb[:planning][:options][:index] = nil
    unless @sb[:planning][:options][:index]
      chart_layouts[@sb[:planning][:options][:model].to_sym].each_with_index do |chart, _idx|
        if chart[:type] == "None" || # No chart is available for this slot
           (@sb[:planning][:options][:tag] && chart[:allowed_child_tag] && !@sb[:planning][:options][:tag].starts_with?(chart[:allowed_child_tag]))  # Tag not allowed
          chart_data.push(nil)              # Push a placeholder onto the chart data array
        else
          options = chart
          if chart[:trends]
            trendcol = perf_get_chart_trendcol(chart)
          end
          options[:chart_type] = chart[:chart_type].to_sym if chart[:chart_type]  # Override :summary chart type if specified in chart definition
          options[:max_value] = @sb[:planning][:options][:display_vms] if @sb[:planning][:options][:display_vms]
          chart_data.push(perf_gen_chart(rpt, options).merge(:menu => chart[:menu]))
          chart[:title] = rpt.title           # Grab title from chart in case formatting added units
        end
        charts.push(chart)
      end
    else
      chart = chart_layouts[@sb[:planning][:options][:model].to_sym][@sb[:planning][:options][:index].to_i]
      perf_remove_chart_cols(chart)
      options = chart.merge(:width => 1000, :height => 700)
      if chart[:trends]
        trendcol = perf_get_chart_trendcol(chart)
      end
      options[:chart_type] = chart[:chart_type].to_sym if chart[:chart_type]  # Override :summary chart type if specified in chart definition
      options[:max_value] = @sb[:planning][:options][:display_vms] if @sb[:planning][:options][:display_vms]
      chart_data.push(perf_gen_chart(rpt, options).merge(:menu => chart[:menu]))
      chart[:title] = rpt.title                 # Grab title from chart in case formatting added units
      charts.push(chart)
    end
    @sb[:planning][:rpt] = rpt                  # Hang on to the report data for the trend charts
    @sb[:planning][:charts] = charts
    @sb[:planning][:chart_data] = {}
    @sb[:planning][:chart_data]["planning"] = chart_data
  end

  # Get the ending trend date for planning trend lookups
  def perf_planning_end_date
    s, e = MiqEnterprise.first.first_and_last_capture
    return if s.nil?                                      # Nothing to do if no util data
    tz = @sb[:planning][:options][:time_profile_tz] || @sb[:planning][:options][:tz]  # Use tz in time profile or chosen tz, if no profile tz
    edate = e.in_time_zone(tz)
    edate = edate.hour < 23 ? edate - 1.day : edate # Eliminate partial end days
    create_time_in_tz([edate.month, edate.day, edate.year].join("/") + " 23", tz)
  end

  # Generate a set of charts based on a report object
  def perf_gen_charts(rpt, perf_options, parent = false)
    model_title = parent ? "Parent-#{perf_options[:parent]}" : perf_options[:model]
    charts = []
    chart_data = []
    case perf_options[:typ]
    when "Hourly"
      chart_layout = perf_get_chart_layout("hourly_perf_charts", model_title)
      unless perf_options[:index]           # Gen all charts if no index present
        chart_layout.each_with_index do |chart, idx|
          if chart[:type] == "None"           # No chart is available for this slot
            chart_data.push(nil)              # Push a placeholder onto the chart data array
          else
            perf_remove_chart_cols(chart)
            options = chart.merge(:zoom_url      => zoom_url = perf_zoom_url("perf_chart_chooser", idx.to_s),
                                  :link_data_url => "javascript:miqChartLinkData( _col_, _row_, _value_, _category_, _series_, _id_ )",
                                  :axis_skip     => 3)
            menu_opts = parent ? {} : {:menu => chart[:menu], :zoom_url => zoom_url}
            chart_data.push(perf_gen_chart(rpt, options).merge(menu_opts))
            chart[:title] = rpt.title           # Grab title from chart in case formatting added units
          end
          charts.push(chart)
        end
      else                                    # Gen chart based on index
        chart = chart_layout[perf_options[:index].to_i]
        perf_remove_chart_cols(chart)
        options = chart.merge(:zoom_url      => zoom_url = perf_zoom_url("perf_chart_chooser", "clear"),
                              :link_data_url => "javascript:miqChartLinkData( _col_, _row_, _value_, _category_, _series_, _id_ )",
                              :axis_skip     => 3,
                              :width         => 1000, :height => 700)
        menu_opts = parent ? {} : {:menu => chart[:menu], :zoom_url => zoom_url}
        chart_data.push(perf_gen_chart(rpt, options).merge(menu_opts))
        chart[:title] = rpt.title           # Grab title from chart in case formatting added units
        charts.push(chart)
      end
    when "realtime"
      chart_layout = perf_get_chart_layout("realtime_perf_charts", model_title)
      unless perf_options[:index]           # Gen all charts if no index present
        chart_layout.each_with_index do |chart, idx|
          if chart[:type] == "None"           # No chart is available for this slot
            chart_data.push(nil)              # Push a placeholder onto the chart data array
          else
            perf_remove_chart_cols(chart)
            options = chart.merge(:zoom_url  => zoom_url = perf_zoom_url("perf_chart_chooser", idx.to_s),
                                  :axis_skip => 29)
            menu_opts = parent ? {} : {:menu => chart[:menu], :zoom_url => zoom_url}
            chart_data.push(perf_gen_chart(rpt, options).merge(menu_opts))
            chart[:title] = rpt.title           # Grab title from chart in case formatting added units
          end
          charts.push(chart)
        end
      else                                    # Gen chart based on index
        chart = chart_layout[perf_options[:index].to_i]
        perf_remove_chart_cols(chart)
        options = chart.merge(:zoom_url  => zoom_url = perf_zoom_url("perf_chart_chooser", "clear"),
                              :axis_skip => 29,
                              :width     => 1000,
                              :height    => 700)
        menu_opts = parent ? {} : {:menu => chart[:menu], :zoom_url => zoom_url}
        chart_data.push(perf_gen_chart(rpt, options).merge(menu_opts))
        chart[:title] = rpt.title           # Grab title from chart in case formatting added units
        charts.push(chart)
      end
    when "Daily"
      chart_layout = perf_get_chart_layout("daily_perf_charts", model_title)
      unless perf_options[:index]
        chart_layout.each_with_index do |chart, idx|
          if chart[:type] == "None"           # No chart is available for this slot
            chart_data.push(nil)              # Push a placeholder onto the chart data array
          else
            perf_remove_chart_cols(chart)
            options = chart.merge(:zoom_url      => zoom_url = perf_zoom_url("perf_chart_chooser", idx.to_s),
                                  :link_data_url => "javascript:miqChartLinkData( _col_, _row_, _value_, _category_, _series_, _id_ )",
                                  :axis_skip     => 3)
            process_chart_trends(chart, rpt, options)
            menu_opts = parent ? {} : {:menu => chart[:menu], :zoom_url => zoom_url}
            chart_data.push(perf_gen_chart(rpt, options).merge(menu_opts))
            chart[:title] = rpt.title           # Grab title from chart in case formatting added units
          end
          charts.push(chart)
        end
      else
        chart = chart_layout[perf_options[:index].to_i]
        if chart
          perf_remove_chart_cols(chart)
          options = chart.merge(:zoom_url => zoom_url = perf_zoom_url("perf_chart_chooser", "clear"),
                                :link_data_url => "javascript:miqChartLinkData( _col_, _row_, _value_, _category_, _series_, _id_ )",
                                :axis_skip => 3,
                                :width => 1000, :height => 700)
          process_chart_trends(chart, rpt, options)
          menu_opts = parent ? {} : {:menu => chart[:menu], :zoom_url => zoom_url}
          chart_data.push(perf_gen_chart(rpt, options).merge(menu_opts))
          chart[:title] = rpt.title           # Grab title from chart in case formatting added units
          charts.push(chart)
        end
      end
    end
    return charts, chart_data
  end

  # Generate performance chart data for a report based on passed in options
  def perf_gen_chart(report, options)
    options[:chart_type] ||= @perf_options[:chart_type]     # Set chart_type for the set of charts, unless overridden already for this chart
    options[:width] ||= 350
    options[:height] ||= 250
    report.title = options[:title]
    report.graph ||= {}
    report.graph[:type]    = options[:type]
    report.graph[:columns] = options[:columns]
    report.graph[:legends] = options[:legends]
    report.graph[:max_col_size] = options[:max_value]
    report.to_chart(settings(:display, :reporttheme), false,
                    MiqReport.graph_options(options))
    chart_data = {
      :data     => report.chart,            # Save the graph data
      :main_col => options[:columns].first  # And the main (first) column of the chart
    }
    if options[:chart2]
      report.graph[:type]    = options[:chart2][:type]
      report.graph[:columns] = options[:chart2][:columns]
      report.to_chart(settings(:display, :reporttheme), false,
                      MiqReport.graph_options(options.merge(:composite => true)))
      chart_data[:data2] = report.chart
    end
    chart_data
  end

  # Build the chart zoom url
  def perf_zoom_url(action, idx)
    url = "javascript:miqAsyncAjax('" +
          url_for_only_path(:action    => action,
                            :id        => @perf_record.id,
                            :chart_idx => idx) +
          "')"
    url
  end

  # Generate the html view of the chart report
  def perf_report_to_html(rpt = nil, charts = nil)
    rpt ||= @sb[:chart_reports]               # Set default if not passed in
    title = rpt.title
    rpt.title = @title.gsub(/Capacity & Utilization/, "#{@perf_options[:typ]} C & U") + " - #{title}"
    return if @perf_options[:index].nil? # Don't show html for graph setting or if multiple charts are showing
    report = rpt.class == Array ? rpt.first : rpt # Get the first or only report
    report = perf_remove_report_cols(report, charts)  # Remove cols that are not in the current chart
    report.to_html                     # Create html from the chart report
  end

  # Generate @summary_info array from report and chart data
  def perf_util_summary_info
    si = {}
    si[:info] = []
    si[:info].push(["Utilization Trend Summary for", @sb[:util][:options][:model] == "MiqEnterprise" ? "Enterprise" : "#{ui_lookup(:model => @sb[:util][:options][:model])} [#{@perf_record.name}]"])
    si[:info].push(["Trend Interval", "#{format_timezone(@sb[:util][:options][:trend_start], @sb[:util][:options][:tz], "date")} - #{format_timezone(@sb[:util][:options][:trend_end], @sb[:util][:options][:tz], "date")}"])
    si[:info].push(["Selected Day", format_timezone(@sb[:util][:options][:chart_date].to_time, "UTC", "date")])
    si[:info].push(["Time Profile", session[:time_profiles][@sb[:util][:options][:time_profile]]]) if @sb[:util][:options][:time_profile]
    si[:info].push(["Time Zone", @sb[:util][:options][:time_profile_tz] ? @sb[:util][:options][:time_profile_tz] : @sb[:util][:options][:tz]])
    si[:info].push(["Classification", @sb[:util][:tags][@sb[:util][:options][:tag]]]) if @sb[:util][:options][:tag]

    if @sb[:util][:trend_charts]
      si[:cpu] = perf_util_summary_section("cpu")         # Get the cpu section
      si[:memory] = perf_util_summary_section("memory")   # Get the memory section
      si[:storage] = perf_util_summary_section("disk")    # Get the disk section
    end

    si
  end

  # Build a section of the summary info hash
  def perf_util_summary_section(s)  # Pass in section name and selected table row
    ss = []

    # Fill in the single day data from the timestamp report
    ts_rpt = @sb[:util][:ts_rpt]
    total_vals = 0.0
    ts_rpt.table.data.each do |r|
      next unless r[0].downcase.include?(s)
      ts_rpt.col_order.each_with_index do |col, col_idx|
        next unless col.ends_with?("_percent")

        # Do NOT show reserve (available) column for Host and Storage nodes
        next if col.include?("_reserve") && ["Host", "Storage"].include?(@sb[:util][:options][:model])

        case s  # Override the formatting for certain column groups on single day percent utilization chart
        when "cpu"
          tip = ts_rpt.format(col + '_tip', r[col + '_tip'],
                              :format => {:function =>                                 {
                                :name      => "mhz_to_human_size",
                                :precision => 1
                              }
                              })
        when "memory"
          tip = ts_rpt.format(col + '_tip', r[col + '_tip'].to_f * 1024 * 1024,
                              :format => {:function =>                                 {
                                :name      => "bytes_to_human_size",
                                :precision => 1
                              }
                              })
        when "disk"
          tip = ts_rpt.format(col + '_tip', r[col + '_tip'],
                              :format => {:function =>                                 {
                                :name      => "bytes_to_human_size",
                                :precision => 1
                              }
                              })
        else
          tip = ts_rpt.format(col + '_tip', r[col + '_tip'])
        end
        val = ts_rpt.format(col, r[col], :format => {:function => {:name => "number_with_delimiter", :suffix => "%"}, :precision => "0"})
        ss.push([_(ts_rpt.headers[col_idx]), "#{tip} (#{val})"])
        total_vals += r[col].to_f # Total up the values for this section
      end
    end
    return nil if total_vals == 0 # If no values, return nil so this section won't show on the screen

    # Get the trend information from the trend charts/report
    @sb[:util][:trend_charts].each do |c|
      s = "storage" if s == "disk"  # disk fields have 'storage' in them
      next unless c[:columns].first.include?("#{s}_")
      if c[:trends]
        c[:trends].each do |t|
          c[:columns].each do |trendcol|
            next unless trendcol.starts_with?("trend_")
            ss.push([Dictionary.gettext(trendcol, :type => :column, :notfound => :titleize) + ": " + t.split(":").last,
                     @sb[:util][:trend_rpt].extras[:trend][trendcol + "|" + t.split(":").first]]) unless trendcol.nil?
          end
        end
      end
    end
    ss
  end

  # Remove cols from report object cols and col_order that are not in a chart before the report is run
  def perf_trim_report_cols(report, chart)
    keepcols = []
    keepcols += ["timestamp", "resource_name", "assoc_ids"]
    keepcols += chart[:columns]
    keepcols += chart[:chart2][:columns] if chart[:chart2]
    # First remove columns from the col_order and header arrays
    report.cols.delete_if { |c| !keepcols.include?(c) }    # Remove columns
    cols = report.col_order.length                      # Remove col_order and header elements
    (1..cols).each do |c|
      idx = cols - c                    # Go thru arrays in reverse
      unless keepcols.include?(report.col_order[idx])
        report.col_order.delete_at(idx)
        report.headers.delete_at(idx)
      end
    end
  end

  # Remove cols from report object that are not in the current chart after the report is run
  def perf_remove_report_cols(report, charts = nil)
    charts ||= @charts.first
    new_rpt = MiqReport.new(report.attributes)  # Make a copy of the report
    new_rpt.table = Marshal.load(Marshal.dump(report.table))
    keepcols = []
    keepcols += ["timestamp", "statistic_time"] unless @top_chart
    keepcols += ["resource_name"] if charts[:type].include?("Pie")
    keepcols += charts[:columns]
    keepcols += charts[:chart2][:columns] if charts[:chart2]
    # First remove columns from the col_order and header arrays
    cols = new_rpt.col_order.length
    (1..cols).each do |c|
      idx = cols - c                    # Go thru arrays in reverse
      unless keepcols.include?(new_rpt.col_order[idx])
        new_rpt.col_order.delete_at(idx)
        new_rpt.headers.delete_at(idx)
      end
    end
    # Now remove columns from the cols array so we don't include them in the CSV download
    new_rpt.cols.each do |c|
      unless keepcols.include?(c)
        new_rpt.table.remove_column(c)
      end
    end
    new_rpt
  end

  def process_chart_trends(chart, rpt, options)
    if chart[:trends] && rpt.extras && rpt.extras[:trend]
      trendcol = perf_get_chart_trendcol(chart)
      options[:trendtip] = chart[:trends].collect do|t|
        t.split(":").last + ": " +
        rpt.extras[:trend][trendcol + "|" + t.split(":").first]
      end.join("\r") unless trendcol.nil?
    end
  end

  # get JSON encoded in Base64
  def parse_chart_click(click_params)
    click_parts = JSON.parse(Base64.decode64(click_params))
    ApplicationController::Performance::ChartClickData.new(
      click_parts['row'].to_i, # legend_index
      click_parts['column'].to_i, # data_index
      click_parts['chart_index'].to_i, # chart_index
      click_parts['chart_name'].split("-").first, # cmd
      click_parts['chart_name'].split("-").second, # model
      click_parts['chart_name'].split("-").third # type
    )
  end

  def breadcrumb_tag(report, legend_index)
    category = Classification.find_by(:name => @perf_options[:cat]).description
    group_by = report.extras[:group_by_tag_descriptions][legend_index]
    "#{category}:#{group_by}"
  end
end
