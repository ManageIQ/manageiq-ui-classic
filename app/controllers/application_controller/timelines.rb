module ApplicationController::Timelines
  extend ActiveSupport::Concern

  # Process changes to timeline selection
  def tl_chooser
    @record = identify_tl_or_perf_record
    @tl_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    tl_build_timeline
    @tl_options.date.update_from_params(params)

    if @tl_options.management_events?
      @tl_options.management.update_from_params(params)
    else
      @tl_options.policy.update_from_params(params)
    end

    if (@tl_options.management_events? && @tl_options.management.categories.present?) ||
       (@tl_options.policy_events? && @tl_options.policy.categories.present?)
      tl_gen_timeline_data('n')
      return unless @timeline
    end

    @timeline = true
    add_flash(_("No events available for this timeline"), :warning) if @tl_options.date.start.nil? && @tl_options.date.end.nil?
    render :update do |page|
      page << javascript_prologue
      page.replace("flash_msg_div", :partial => "layouts/flash_msg")
      page.replace("tl_div", :partial => "layouts/tl_detail")
      page << "ManageIQ.calendar.calDateFrom = new Date(#{@tl_options.date.start});" unless @tl_options.date.start.nil?
      page << "ManageIQ.calendar.calDateTo = new Date(#{@tl_options.date.end});" unless @tl_options.date.end.nil?
      page << 'miqBuildCalendar();'
      page << "miqSparkle(false);"
    end
  end

  def timeline_data
    blob = BinaryBlob.find(session[:tl_xml_blob_id])
    render :xml => blob.binary
    blob.destroy
  end

  private ############################

  def tl_get_rpt(timeline)
    MiqReport.new(YAML.load(File.read("#{ApplicationController::TIMELINES_FOLDER}/miq_reports/#{timeline}.yaml")))
  end

  def tl_build_init_options(refresh = nil)
    @tl_record = @record.kind_of?(MiqServer) ? @record.vm : @record # Use related server vm record
    if @tl_options.nil? ||
       (refresh != "n" && params[:refresh] != "n" && @tl_options[:model] != @tl_record.class.base_class.to_s)
      @tl_options = Options.new
      @tl_options.date.typ = 'Daily'
      @tl_options.date.days = '7'
      @tl_options[:model] = @tl_record.class.base_class.to_s
      @tl_options.policy.categories = []
    end
    @tl_options.tl_show = params[:tl_show] || "timeline"
    sdate, edate = @tl_record.first_and_last_event(@tl_options.evt_type)
    @tl_options.date.update_start_end(sdate, edate)

    if @tl_options.policy_events?
      @tl_options.policy.result ||= "both"
      @tl_options.policy.categories ||= []
      if @tl_options.policy.categories.blank?
        @tl_options.policy.categories.push("VM Operation")
        # had to set this here because if it this is preselected in cboxes, it doesnt send the params back for this cb to tl_chooser
        @tl_options.policy.events.keys.sort.each_with_index do |e, i|
          if e == "VM Operation"
            @tl_options.policy.categories[i] = e
          end
        end
      end
    end
  end

  def tl_build_timeline_report_options
    if !@tl_options.date.start.nil? && !@tl_options.date.end.nil?
      tl_type = @tl_options.management_events? ? "events" : "policy_events"
      tl_granularity = case @tl_options.date.typ
                       when "Hourly" then "hourly"
                       when "Daily" then "daily"
                       end
      @report = tl_get_rpt("tl_#{tl_type}_#{tl_granularity}")
      @report.headers.map! { |header| _(header) }

      to_date = Date.parse(@tl_options.date.end_date)
      to_dt = create_time_in_utc("#{to_date.strftime} 23:59:59",
                                 session[:user_tz])

      from_date = to_date - @tl_options.date.days.to_i + 1
      from_dt = create_time_in_utc("#{from_date.strftime} 00:00:00",
                                   session[:user_tz])

      rec_cond, *rec_params = @tl_record.event_where_clause(@tl_options.evt_type)
      conditions = [rec_cond, "timestamp >= ?", "timestamp <= ?"]
      parameters = rec_params + [from_dt, to_dt]

      tl_add_event_type_conditions(conditions, parameters)
      tl_add_policy_conditions(conditions, parameters) if @tl_options.policy_events?

      condition = conditions.join(") and (")
      @report.where_clause = ["(#{condition})"] + parameters
      @report.rpt_options ||= {}
      @report.rpt_options[:categories] = @tl_options.categories
      @title = @report.title
    end
  end

  def tl_add_event_type_conditions(conditions, parameters)
    tl_add_event_type_inclusions(conditions, parameters)
    tl_add_event_type_exclusions(conditions, parameters)
  end

  def tl_add_event_type_inclusions(conditions, parameters)
    expressions = []
    @tl_options.get_set(:regexes).each do |regex|
      expressions << tl_get_regex_sql_expression(regex)
      parameters << regex.source
    end

    includes = @tl_options.get_set(:include_set)
    unless includes.empty?
      expressions << "event_type in (?)"
      parameters << includes
    end

    condition = expressions.join(") or (")
    conditions << "(#{condition})" unless condition.empty?
  end

  def tl_get_regex_sql_expression(regex)
    regex.casefold? ? "event_type ~* ?" : "event_type ~ ?"
  end

  def tl_add_event_type_exclusions(conditions, parameters)
    excludes = @tl_options.get_set(:exclude_set)
    unless excludes.empty?
      conditions << "event_type not in (?)"
      parameters << excludes
    end
  end

  def tl_add_policy_conditions(conditions, parameters)
    if @tl_options.policy.result != "both"
      conditions << "result = ?"
      parameters << @tl_options.policy.result
    end
  end

  def tl_build_timeline(refresh = nil)
    tl_build_init_options(refresh) # Intialize options(refresh) if !@report
    @ajax_action = "tl_chooser"
  end

  def tl_gen_timeline_data(refresh = nil)
    tl_build_timeline(refresh)
    tl_build_timeline_report_options
    @timeline = true unless @report # need to set this incase @report is not there, when switching between Management/Policy events
    if @report
      unless params[:task_id] # First time thru, kick off the report generate task
        initiate_wait_for_task(:task_id => @report.async_generate_table(:userid => session[:userid]))
        return
      end

      @timeline = true
      miq_task = MiqTask.find(params[:task_id]) # Not first time, read the task record
      @report = miq_task.task_results

      if !miq_task.results_ready?
        add_flash(_("Error building timeline %{error_message}") % {:error_message => miq_task.message}, :error)
      else
        @timeline = @timeline_filter = true
        if @report.table.data.length.zero?
          add_flash(_("No records found for this timeline"), :warning)
        else
          @report.extras[:browser_name] = browser_info(:name)
          @tl_json = @report.to_timeline
          #         START of TIMELINE TIMEZONE Code
          session[:tl_position] = @report.extras[:tl_position]
          #         session[:tl_position] = format_timezone(@report.extras[:tl_position],Time.zone,"tl")
          #         END of TIMELINE TIMEZONE Code
        end
      end
    end
  end

  def set_tl_session_data(options = @tl_options, controller = controller_name)
    unless options.nil?
      options.drop_cache
      session["#{controller}_tl".to_sym] = options unless options.nil?
    end
  end

  def tl_session_data(controller = controller_name)
    session["#{controller}_tl".to_sym]
  end
end
