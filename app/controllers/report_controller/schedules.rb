module ReportController::Schedules
  extend ActiveSupport::Concern

  def show_schedule
    if @schedule.nil?
      flash_to_session
      redirect_to(:action => 'schedules')
      return
    end

    # Get configured tz, else use user's tz
    @timezone = @schedule.run_at && @schedule.run_at[:tz] ? @schedule.run_at[:tz] : session[:user_tz]

    if @schedule.filter.kind_of?(MiqExpression)
      record      = MiqReport.find(@schedule.filter.exp["="]["value"])
      @rep_filter = record.name
    end
    @breadcrumbs = []
    drop_breadcrumb(:name => @schedule.name, :url => "/report/show_schedule/#{@schedule.id}")
    if @schedule.sched_action[:options] && @schedule.sched_action[:options][:email]
      @email_to = []
      @schedule.sched_action[:options][:email][:to].each_with_index do |e, _e_idx|
        u = User.find_by(:email => e)
        @email_to.push(u ? "#{u.name} (#{e})" : e)
      end
    end
    # render :action=>"show_schedule"
  end

  def schedule_get_all
    @schedules = true
    @force_no_grid_xml = true
    @gtl_type = "list"
    if params[:ppsetting]                                               # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                         # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:schedule_sortcol].nil? ? 0 : session[:schedule_sortcol].to_i
    @sortdir = session[:schedule_sortdir].nil? ? "ASC" : session[:schedule_sortdir]

    if super_admin_user? # Super admins see all user's schedules
      @view, @pages = get_view(MiqSchedule, :named_scope => [[:with_towhat, "MiqReport"]]) # Get the records (into a view) and the paginator
    else
      @view, @pages = get_view(MiqSchedule, :named_scope => [[:with_towhat, "MiqReport"], [:with_userid, session[:userid]]]) # Get the records (into a view) and the paginator
    end

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:schedule_sortcol] = @sortcol
    session[:schedule_sortdir] = @sortdir

    @sb[:tree_typ]   = "schedules"
    @right_cell_text = _("All Schedules")
    @right_cell_div  = "schedule_list"
  end

  def schedule_new
    assert_privileges("miq_report_schedule_add")
    @schedule               = MiqSchedule.new(:userid => session[:userid])
    @in_a_form              = true
    @schedule.resource_type = "MiqReport"
    if @sb[:tree_typ] == "reports"
      exp                   = {}
      exp["="]              = {"field" => "MiqReport-id", "value" => @sb[:miq_report_id]}
      @_params.delete(:id) # incase add schedule button was pressed from report show screen.
      @schedule.filter      = MiqExpression.new(exp)
      miq_report            = MiqReport.find(@sb[:miq_report_id])
      @schedule.name        = miq_report.name
      @schedule.description = miq_report.title
      @changed = session[:changed] = true
    end
    schedule_edit
  end
  alias_method :miq_report_schedule_add, :schedule_new

  # Delete all selected or single displayed action(s)
  def miq_report_schedule_delete
    assert_privileges("miq_report_schedule_delete")
    scheds = find_records_with_rbac(MiqSchedule, checked_or_params)
    single_name = scheds.first.name if scheds.length == 1
    process_schedules(scheds, "destroy") unless scheds.empty?
    unless flash_errors?
      if single_name
        add_flash(_("Schedule %{name} was deleted") % {:name => single_name}, :success, true)
      else
        add_flash(_("The selected Schedules were deleted"), :success, true)
      end
    end
    self.x_node = "root"
    replace_right_cell(:replace_trees => [:schedules])
  end

  def miq_report_schedule_run_now
    assert_privileges("miq_report_schedule_run_now")
    schedules = find_records_with_rbac(MiqSchedule, checked_or_params)
    schedules.sort_by { |e| e.name.downcase }.each do |schedule|
      MiqSchedule.queue_scheduled_work(schedule.id, nil, Time.now.utc.to_i, nil)
      audit = {
        :event        => "queue_scheduled_work",
        :message      => "Schedule [#{schedule.name}] queued to run from the UI by user #{current_user.name}",
        :target_id    => schedule.id,
        :target_class => "MiqSchedule",
        :userid       => session[:userid]
      }
      AuditEvent.success(audit)
    end
    unless flash_errors?
      msg = if params[:id]
              _("The selected Schedule has been queued to run")
            else
              _("The selected Schedules have been queued to run")
            end
      add_flash(msg, :success, true)
    end
    get_node_info
    replace_right_cell
  end

  def schedule_toggle(enable)
    assert_privileges("miq_report_schedule_#{enable ? 'enable' : 'disable'}")
    msg = enable ? _("The selected Report Schedules were enabled") : _("The selected Report Schedules were disabled")
    scheds = find_records_with_rbac(MiqSchedule, checked_or_params)
    schedule_enable_disable(scheds, enable)
    add_flash(msg, :info, true)
    schedule_get_all
    replace_right_cell
  end

  def miq_report_schedule_enable
    schedule_toggle(true)
  end

  def miq_report_schedule_disable
    schedule_toggle(false)
  end

  # AJAX driven routine to check for changes in ANY field on the form
  def schedule_form_field_changed
    return unless load_edit("schedule_edit__#{params[:id]}", "replace_cell__explorer")
    schedule_get_form_vars
    if @edit[:new][:filter]
      @folders ||= []
      report_selection_menus
    end
    render :update do |page|
      page << javascript_prologue
      if params[:filter_typ]
        @edit[:new][:subfilter] = nil
        @edit[:new][:repfilter] = @reps = nil
      elsif params[:subfilter_typ]
        @edit[:new][:repfilter] = nil
      end
      page.replace("form_filter_div", :partial => "schedule_form_filter")
      javascript_for_timer_type(params[:timer_typ]).each { |js| page << js }
      if params[:time_zone]
        page << "ManageIQ.calendar.calDateFrom = new Date(#{(Time.zone.now - 1.month).in_time_zone(@edit[:tz]).strftime("%Y,%m,%d")});"
        page << "miqBuildCalendar();"
        page << "$('#miq_date_1').val('#{@edit[:new][:timer].start_date}');"
        page << "$('#start_hour').val('#{@edit[:new][:timer].start_hour.to_i}');"
        page << "$('#start_min').val('#{@edit[:new][:timer].start_min.to_i}');"
        page.replace_html("tz_span", @timezone_abbr)
      end
      if @email_refresh
        page.replace("edit_email_div",
                     :partial => "layouts/edit_email",
                     :locals  => {:action_url => "schedule_form_field_changed",
                                  :record     => @schedule})
        page.replace("schedule_email_options_div", :partial => "schedule_email_options")
      end

      if params[:timer_typ].present?
        # when timer_typ set to hourly set starting date to current day otherwise it's the day after
        @edit[:new][:timer].start_date = if params[:timer_typ] == 'Hourly'
                                           Time.zone.now.strftime("%m/%d/%Y")
                                         else
                                           (Time.zone.now + 1.day).strftime("%m/%d/%Y")
                                         end
      end
      page << "$('#miq_date_1').val('#{@edit[:new][:timer].start_date}');"
      page << "$('#miq_date_1').datepicker('update');"

      changed = (@edit[:new] != @edit[:current])
      if changed != session[:changed]
        session[:changed] = changed
        page << javascript_for_miq_button_visibility(changed)
      end
      page << "miqSparkle(false);"
    end
  end

  def schedule_edit
    assert_privileges("miq_report_schedule_edit")
    case params[:button]
    when "cancel"
      @schedule = MiqSchedule.find(session[:edit][:sched_id]) if session[:edit] && session[:edit][:sched_id]
      if !@schedule || @schedule.id.blank?
        add_flash(_("Add of new Schedule was cancelled by the user"))
      else
        add_flash(_("Edit of Schedule \"%{name}\" was cancelled by the user") % {:name => @schedule.name})
      end
      @schedule = nil
      @edit = session[:edit] = nil # clean out the saved info
      @in_a_form = false

      replace_right_cell
    when "save", "add"
      id = params[:id] ? params[:id] : "new"
      return unless load_edit("schedule_edit__#{id}", "replace_cell__explorer")
      schedule = @edit[:sched_id] ? MiqSchedule.find(@edit[:sched_id]) : MiqSchedule.new(:userid => session[:userid])
      if !@edit[:new][:repfilter] || @edit[:new][:repfilter] == ""
        add_flash(_("A Report must be selected"), :error)
      end
      schedule_set_record_vars(schedule)
      schedule_valid?(schedule)
      if schedule.valid? && !flash_errors? && schedule.save
        AuditEvent.success(build_saved_audit(schedule, @edit))
        if @edit[:sched_id]
          add_flash(_("Schedule \"%{name}\" was saved") % {:name => schedule.name})
        else
          add_flash(_("Schedule \"%{name}\" was added") % {:name => schedule.name})
        end
        params[:id] = schedule.id.to_s # reset id in params for show
        @edit = session[:edit] = nil # clean out the saved info

        # ensure we land in the right accordion with the right tree and
        # with the listing opened even when entering 'add' from the reports
        # menu
        @_params[:accord] = "schedules" unless x_active_accord == :schedules
        self.x_active_tree   = "schedules_tree"
        self.x_active_accord = "schedules"
        self.x_node = "msc-#{schedule.id}"
        replace_right_cell(:replace_trees => [:schedules])
      else
        schedule.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        @changed = session[:changed] = (@edit[:new] != @edit[:current])
        drop_breadcrumb(:name => "Edit Schedule", :url => "/miq_schedule/edit")
        javascript_flash
      end
    when "reset", nil # Reset or first time in
      add_flash(_("All changes have been reset"), :warning) if params[:button] == "reset"
      if x_active_tree != :reports_tree
        # dont set these if new schedule is being added from a report show screen
        @schedule ||= if params[:id] == "new"
                        MiqSchedule.new(:userid => session[:userid])
                      else
                        find_record_with_rbac(MiqSchedule, checked_or_params)
                      end
        session[:changed] = false
      end
      schedule_set_form_vars
      schedule_build_edit_screen
      replace_right_cell
    end
  end
  alias_method :miq_report_schedule_edit, :schedule_edit

  private

  # Common Schedule button handler routines
  def process_schedules(schedules, task)
    process_elements(schedules, MiqSchedule, task)
  end

  # Validate some of the schedule fields
  def schedule_valid?(sched)
    valid = true
    if sched.sched_action[:options] &&
       sched.sched_action[:options][:send_email] &&
       sched.sched_action[:options][:email]
      if sched.sched_action[:options][:email][:from].present? &&
         !sched.sched_action[:options][:email][:from].email?
        valid = false
        add_flash(_("E-mail address 'From' is not valid"), :error)
      end
      if sched.sched_action[:options][:email][:to].blank?
        valid = false
        add_flash(_("At least one To E-mail address must be configured"), :error)
      elsif sched.sched_action[:options][:email][:to].find { |i| !i.to_s.email? }
        valid = false
        add_flash(_("One of e-mail addresses 'To' is not valid"), :error)
      end
    end
    unless flash_errors?
      if sched.run_at[:interval][:unit] == "once" &&
         sched.run_at[:start_time].to_time.utc < Time.now.utc &&
         sched.enabled == true
        add_flash(_("Warning: This 'Run Once' timer is in the past and will never run as currently configured"), :warning)
      end
    end
    valid
  end

  # Set form variables for edit
  def schedule_set_form_vars
    @timezone_abbr = get_timezone_abbr
    @edit = {}
    @folders = []

    # Remember how this edit started
    @edit[:type] = %w[miq_report_schedule_copy miq_report_schedule_new].include?(params[:action]) ? 'schedule_new' : 'schedule_edit'

    # Get configured tz, default to user's tz
    @edit[:tz] = @schedule.run_at && @schedule.run_at[:tz] ? @schedule.run_at[:tz] : session[:user_tz]

    @edit[:sched_id] = @schedule.id
    @edit[:new]      = {}
    @edit[:current]  = {}
    @edit[:key]      = "schedule_edit__#{@schedule.id || "new"}"
    @menu            = get_reports_menu
    @menu.each { |r| @folders.push(r[0]) }

    @edit[:new][:name]        = @schedule.name
    @edit[:new][:description] = @schedule.description
    @edit[:new][:enabled]     = @schedule.enabled.nil? ? false : @schedule.enabled
    @edit[:new][:send_email]  = @schedule.sched_action.nil? || !@schedule.sched_action.key?(:options) ? false : @schedule.sched_action[:options][:send_email] == true
    @edit[:new][:email]       = {}
    if @schedule.sched_action && @schedule.sched_action[:options] && @schedule.sched_action[:options][:email]
      @edit[:new][:email] = copy_hash(@schedule.sched_action[:options][:email])
    end
    @edit[:new][:email][:send_if_empty] = true if @edit[:new][:email][:send_if_empty].nil?

    if @schedule.sched_action && @schedule.sched_action[:options] && @schedule.sched_action[:options][:email]
      # rebuild hash to hold user's email along with name if user record was found for display, defined as hash so only email id can be sent from form to be deleted from array above
      @email_to = {}
      @schedule.sched_action[:options][:email][:to].each_with_index do |e, _e_idx|
        u = User.find_by(:email => e)
        @email_to[e] = u ? "#{u.name} (#{e})" : e
      end
    end

    if @schedule.filter
      record = MiqReport.find(@schedule.filter.exp["="]["value"])
      @menu.each do |m|
        m[1].each do |f|
          f.each do |r|
            next if r.class == String
            r.each do |rep|
              if rep == record.name
                @edit[:new][:filter] = m[0]
                @edit[:new][:subfilter] = f[0]
              end
            end
          end
        end
      end
      @edit[:new][:repfilter] = record.id
      report_selection_menus
    end
    set_edit_timer_from_schedule(@schedule)

    @edit[:current] = copy_hash(@edit[:new])
    session[:edit] = @edit
  end

  # Get variables from edit form
  def schedule_get_form_vars
    @schedule = @edit[:sched_id] ? MiqSchedule.find(@edit[:sched_id]) : MiqSchedule.new(:userid => session[:userid])
    copy_params_if_present(@edit[:new], params, %i[name description])
    @edit[:new][:enabled] = (params[:enabled] == "1") if params[:enabled]
    @edit[:new][:filter] = params[:filter_typ] if params[:filter_typ]
    @edit[:new][:subfilter] = params[:subfilter_typ] if params[:subfilter_typ]
    if params[:repfilter_typ] && params[:repfilter_typ] != "<Choose>"
      rep = MiqReport.for_user(current_user).find(params[:repfilter_typ].to_i)
      @edit[:new][:repfilter] = rep.id
    elsif params[:repfilter_typ] && params[:repfilter_typ] == "<Choose>"
      @edit[:new][:repfilter] = nil
    end
    @edit[:new][:timer] ||= ReportHelper::Timer.new
    @edit[:new][:timer].update_from_hash(params)

    if params[:time_zone]
      @edit[:tz] = params[:time_zone]
      @timezone_abbr = Time.now.in_time_zone(@edit[:tz]).strftime("%Z")
    end

    @edit[:new][:filter] = "" if @edit[:new][:filter] == "<Choose>"
    @edit[:new][:subfilter] = "" if @edit[:new][:subfilter] == "<Choose>"

    @edit[:new][:email][:from] = params[:from] if params.key?(:from)
    @edit[:email] = params[:email] if params.key?(:email)
    if params[:user_email]
      @edit[:new][:email][:to] ||= []
      @edit[:new][:email][:to].push(params[:user_email])
      @edit[:new][:email][:to].sort!
      @edit[:user_emails].delete(params[:user_email])
    end

    if params[:button] == "add_email"
      @edit[:new][:email][:to] ||= []
      @edit[:new][:email][:to].push(@edit[:email]) unless @edit[:email].blank? || @edit[:new][:email][:to].include?(@edit[:email])
      @edit[:new][:email][:to].sort!
      @edit[:email] = nil
    end

    if params[:remove_email]
      @edit[:new][:email][:to].delete(params[:remove_email])
      build_user_emails_for_edit
    end

    if params[:user_email] || params[:button] == "add_email" || params[:remove_email]
      # rebuild hash to hold user's email along with name if user record was found for display, defined as hash so only email id can be sent from form to be deleted from array above
      @email_to = {}
      @edit[:new][:email][:to].each_with_index do |e, _e_idx|
        u = User.find_by_email(e)
        @email_to[e] = u ? "#{u.name} (#{e})" : e
      end
    end

    @edit[:new][:email][:send_if_empty] = (params[:send_if_empty] == "1") if params.key?(:send_if_empty)

    if params.key?(:send_txt) || params.key?(:send_csv) || params.key?(:send_pdf)
      @edit[:new][:email][:attach] ||= []
      if params.key?(:send_txt)
        params[:send_txt] == "1" ? @edit[:new][:email][:attach].push(:txt) : @edit[:new][:email][:attach].delete(:txt)
      end
      if params.key?(:send_csv)
        params[:send_csv] == "1" ? @edit[:new][:email][:attach].push(:csv) : @edit[:new][:email][:attach].delete(:csv)
      end
      if params.key?(:send_pdf)
        params[:send_pdf] == "1" ? @edit[:new][:email][:attach].push(:pdf) : @edit[:new][:email][:attach].delete(:pdf)
      end
      @edit[:new][:email].delete(:attach) if @edit[:new][:email][:attach].blank?
    end

    @edit[:new][:send_email] = (params[:send_email_cb] == "1") if params.key?(:send_email_cb)
    @email_refresh = true if params[:user_email] || params[:remove_email] ||
                             params[:button] == "add_email" || params.key?(:send_email_cb)
  end

  def schedule_build_edit_screen
    @schedule = @edit[:sched_id] ? MiqSchedule.find(@edit[:sched_id]) : MiqSchedule.new(:userid => session[:userid])
    @in_a_form = true
    build_user_emails_for_edit
  end

  # Set record variables to new values
  def schedule_set_record_vars(schedule)
    schedule.name = @edit[:new][:name]
    schedule.description = @edit[:new][:description]
    schedule.enabled = @edit[:new][:enabled]
    schedule.resource_type = "MiqReport" # Default schedules apply to MiqReport model for now

    email_url_prefix = url_for_only_path(:controller => "report", :action => "show_saved") + "/"
    schedule_options = {
      :send_email       => @edit[:new][:send_email],
      :email_url_prefix => email_url_prefix,
      :miq_group_id     => current_user.current_group.id
    }

    schedule.sched_action = {:method => "run_report", :options => schedule_options}

    schedule.sched_action[:options][:email] = copy_hash(@edit[:new][:email]) if @edit[:new][:send_email]
    schedule.run_at = @edit[:new][:timer].flush_to_miq_schedule(schedule.run_at, @edit[:tz])

    # Build the filter expression
    exp = {}

    unless !@edit[:new][:repfilter] || @edit[:new][:repfilter] == ""
      record = MiqReport.find(@edit[:new][:repfilter].to_i)
      exp["="] = {"field" => "MiqReport-id", "value" => record.id} if record
      schedule.filter = MiqExpression.new(exp)
    end
  end

  def get_schedule(nodeid)
    @record = @schedule = MiqSchedule.find(nodeid.split('__').last.to_i)
    show_schedule
    @right_cell_text = _("Schedule \"%{name}\"") % {:name => @schedule.name}
    @right_cell_div  = "schedule_list"
  end
end
