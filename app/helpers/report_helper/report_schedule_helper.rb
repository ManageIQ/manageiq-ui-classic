module ReportHelper::ReportScheduleHelper
  def report_schedule_summary(schedule, email_to, rep_filter, timezone)
    data = {:title => _('Schedule Info'), :mode => "miq_report_schedule_info"}
    rows = []
    rows.push(row_data(_('Description'), schedule.description))
    rows.push(row_data(_('Active'), _(schedule.enabled.to_s.capitalize)))
    email_run = schedule.sched_action[:options] && schedule.sched_action[:options][:send_email] ? _("True") : _("False")
    rows.push(row_data(_('E-Mail after Running'), email_run))
    if schedule.sched_action[:options] && schedule.sched_action[:options][:send_email] && schedule.sched_action[:options][:email]
      if schedule.sched_action[:options][:email][:from].blank?
        rows.push(row_data(_('From E-mail'), _("(Default: %{email_from})") % {:email_from => ::Settings.smtp.from}))
      else
        rows.push(row_data(_('From E-mail'), schedule.sched_action[:options][:email][:from]))
      end
    end
    email = email_to.blank? ? "" : email_to.join(';')
    rows.push(row_data(_('To E-mail'), email))
    rows.push(row_data(_('Report Filter'), rep_filter))
    rows.push(row_data(_('Run At'), schedule.run_at_to_human(timezone).to_s))
    last_run = schedule.last_run_on.blank? ? "" : format_timezone(schedule.last_run_on, timezone, "view")
    rows.push(row_data(_('Last Run Time'), last_run))
    next_run = schedule.next_run_on.blank? ? "" : format_timezone(schedule.next_run_on, timezone, "view")
    rows.push(row_data(_('Next Run Time'), next_run))
    rows.push(row_data(_('Zone'), schedule.v_zone_name))

    data[:rows] = rows
    miq_structured_list(data)
  end
end
