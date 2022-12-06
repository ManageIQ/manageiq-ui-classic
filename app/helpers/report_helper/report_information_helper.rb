module ReportHelper::ReportInformationHelper
  def report_info_summary(sb_data, report, schedules, widget_nodes)
    if sb_data[:active_tab] == 'report_info'
      safe_join([
                  report_information(sb_data, report),
                  report_schedule(schedules),
                  report_widget(widget_nodes),
                ])
    end
  end

  private

  def report_information(sb_data, report)
    if sb_data[:miq_report_id] && report
      data = {:title => _('Basic Information'), :mode => 'miq_report_basic_information'}
      rows = []
      rows.push(row_data(_('ID'), report.id))
      rows.push(row_data(_('Title'), report.title))
      rows.push(row_data(_('Primary (Record) Filter'), report.conditions.to_human)) if report.conditions
      rows.push(row_data(_('Secondary (Display) Filter'), report.display_filter.to_human)) if report.display_filter
      if report.sortby
        sortby = report.sortby.map { |s| report_dictionary(s, :column) }
        rows.push(row_data(_('Sort By'), sortby.join(", ")))
      end
      rows.push(row_data(_('Chart'), report.graph[:type])) if report.graph
      rows.push(row_data(_('Based On'), report_dictionary(report.db, :model)))
      rows.push(row_data(_('User'), report.user ? report.user.userid : ""))
      rows.push(row_data(_('EVM Group'), report.miq_group ? report.miq_group.description : ""))
      rows.push(row_data(_('Updated On'), format_timezone(report.updated_on, Time.zone, "gtl")))
      data[:rows] = rows
      miq_structured_list(data)
    end
  end

  def report_schedule(schedules)
    data = {:title => _('Schedules'), :mode => "miq_report_schedules bordered-list simple_table", :rows => []}
    if schedules.blank?
      data[:message] = _("Report is not Scheduled.")
    else
      data[:headers] = [_('Name'), _('Description'), _('Active'), _('Interval'), _('Last Run Time'), _('Next Run Time'), _('Zone')]
      data[:headers].push(_('Username')) if super_admin_user?

      rows = []
      schedules.each do |s|
        tz = s.run_at && s.run_at[:tz] ? s.run_at[:tz] : session[:user_tz]
        schedule_url = role_allows?(:feature => 'miq_report_schedules') ? report_action_url("msc-#{s.id}", "schedules") : ""
        cells = [
          {:value => s.name, :icon => "fa fa-clock-o"},
          {:value => s.description},
          {:value => _(s.enabled)},
          {:value => s.run_at[:interval][:unit]},
          {:value => s.last_run_on ? format_timezone(s.last_run_on, tz, "gtl") : ""},
          {:value => s.next_run_on ? format_timezone(s.next_run_on, tz, "gtl") : ""},
          {:value => s.v_zone_name},
        ]
        cells.push({:value => s.userid}) if super_admin_user?
        rows.push({
                    :cells   => cells,
                    :title   => _("View this Schedule"),
                    :onclick => schedule_url,
                  })
      end

      data[:rows] = rows
    end
    miq_structured_list(data)
  end

  def report_widget(widget_nodes)
    data = {:title => _('Widgets'), :mode => "miq_report_widgets bordered-list simple_table", :rows => []}
    if widget_nodes.blank?
      data[:message] = _("Report doesn't belong to Widgets.")
    else
      data[:headers] = [_('Title'), _('Description'), _('Enabled')]

      rows = []
      widget_nodes.each do |w|
        widget_action = role_allows?(:feature => 'miq_report_widget_editor') ? report_action_url("xx-#{ReportController::Widgets::WIDGET_CONTENT_TYPE.invert[w.content_type]}_-#{w.id}", "widgets") : ""
        rows.push({
                    :cells   => [
                      {:value => w.title, :icon => "fa fa-file-text-o"},
                      {:value => w.description},
                      {:value => _(w.enabled)},
                    ],
                    :title   => _("Click to view selected widget"),
                    :onclick => widget_action,
                  })
      end

      data[:rows] = rows
    end
    miq_structured_list(data)
  end
end
