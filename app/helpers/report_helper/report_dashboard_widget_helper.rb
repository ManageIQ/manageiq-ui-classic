module ReportHelper::ReportDashboardWidgetHelper
  def dashboard_widget_summary(widget, sb_data)
    schedule = widget.miq_schedule
    timezone = schedule&.run_at ? schedule.run_at[:tz] : session[:user_tz]
    safe_join([
                widget_basic_information(widget),
                widget_status(widget, sb_data, timezone),
                widget_sb_type_report(widget, sb_data),
                widget_timer(schedule, timezone, sb_data),
                widget_visibility(widget),
              ])
  end

  private

  def widget_basic_information(widget)
    read_only = widget.read_only ? '* ' : ''
    data = {:title => _('Basic Information'), :mode => "miq_widget_basic_information"}
    data[:rows] = [
      row_data(_('Title'), "#{read_only}#{widget.title}"),
      row_data(_('Descrption'), "#{read_only}#{widget.description}"),
      row_data(_('Active'), _(widget.enabled)),
      row_data(_('Default'), _(widget.read_only))
    ]
    miq_structured_list(data)
  end

  def widget_status(widget, sb_data, timezone)
    return if sb_data[:wtype] == "m"

    data = {:title => _('Status'), :mode => "miq_widget_status"}
    glyphicon = widget.decorate.try(:secondary_icon)
    current_status = glyphicon ? [{:icon => glyphicon, :value => _(widget.status)}] : _(widget.status)
    data[:rows] = [
      row_data(_('Current Status'), current_status),
      row_data(_('Last Run Time'), h(widget.last_run_on ? format_timezone(widget.last_run_on, timezone, "view") : "")),
      row_data(_('Message'), h(widget.status_message))
    ]
    miq_structured_list(data)
  end

  def widget_sb_type_report(widget, sb_data)
    case sb_data[:wtype]
    when "r"
      widget_report_options(widget, sb_data)
    when "c"
      widget_chart_options(widget)
    when "m"
      widget_menu_shortcuts(widget)
    end
  end

  def widget_report_options(widget, sb_data)
    data = {:title => _('Report Options'), :mode => "miq_widget_report_options"}
    rows = []
    if widget.resource
      rows.push(row_data(_('Report Filter'), h(widget.resource.name)))
    else
      rows.push(row_data(_('Report Filter'), "*** %s ***" % _('Report no longer exists'), 'color_red'))
    end
    sb_data[:col_order].each_with_index do |col, idx|
      rows.push(row_data("%s #{idx + 1}" % _('Column'), h(col)))
    end
    rows.push(row_data(_('Row Count'), h(widget.row_count)))
    data[:rows] = rows
    miq_structured_list(data)
  end

  def widget_chart_options(widget)
    data = {:title => _('Chart Options'), :mode => "miq_widget_report_options"}
    rows = []
    if widget.resource
      rows.push(row_data(_('Filter'), h(widget.resource.title)))
    else
      rows.push(row_data(_('Filter'), "*** %s ***" % _('Chart no longer exists'), 'color_red'))
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def widget_menu_shortcuts(widget)
    data = {:title => _('Menu Shortcuts'), :mode => "miq_widget_menu_shortcuts"}
    rows = []
    widget.miq_widget_shortcuts.order("sequence").each_with_index do |_ws, wsi|
      rows.push(row_data('', h(widget.description))) unless wsi == 0
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def widget_timer(schedule, timezone, sb_data)
    if sb_data[:wtype] == "m"

      data = {:title => _('Timer'), :mode => "miq_widget_timer"}
      rows = []
      if schedule.kind_of?(MiqSchedule)
        rows.push(row_data(_('Run At'), h(schedule.run_at_to_human(timezone).to_s)))
        run_time = schedule.next_run_on.blank? ? '' : h(format_timezone(schedule.next_run_on, timezone, "view"))
        rows.push(row_data(_('Next Run Time'), run_time))
        data[:rows] = rows
      else
        data[:message] = "#{_('No timer is attached to this Widget, its contents will not be updated.')} #{_('Edit this Widget to configure a timer.')}"
      end
      miq_structured_list(data)
    end
  end

  def widget_visibility(widget)
    data = {:title => _('Visibility'), :mode => "miq_widget_visibility"}
    rows = []
    rows.push(row_data(_('Show'), visibility_options(widget)))
    rows.push(row_data('', _('* Fields are read only for default Widgets'))) if widget.read_only
    data[:rows] = rows
    miq_structured_list(data)
  end
end
