module SettingsScheduleHelper
  private

  def settings_schedule_summary(schedule, exp_table, object_class, object_name)
    automation_request_check = schedule.sched_action[:method] == 'automation_request'
    summary = [
      settings_schedule_basic_info(schedule),
      settings_schedule_filter_details(schedule, exp_table),
    ]
    if automation_request_check
      summary.push(settings_schedule_object_details(schedule))
      summary.push(settings_schedule_object_attribute(object_class, object_name))
      summary.push(settings_schedule_attribute_value_pairs(schedule)) if schedule.filter[:ui][:ui_attrs].present?
    end
    safe_join(summary)
  end

  def settings_schedule_basic_info(schedule)
    data = {
      :title => _('Basic Information'),
      :mode  => "settings_schedule_basic_info",
    }

    rows = [
      row_data(_('Description'), schedule.description),
      row_data(_('Active'), schedule.enabled),
    ]

    if schedule.sched_action[:method] && schedule.sched_action[:method] == "check_compliance"
      rows.push(row_data(_('Action'), "#{ui_lookup(:model => schedule.resource_type)} #{_('Compliance Check')}"))
    elsif schedule.sched_action[:method] && schedule.sched_action[:method] == "automation_request"
      rows.push(row_data(_('Action'), _('Automate Task')))
    else
      rows.push(row_data(_('Action'), "#{ui_lookup(:model => schedule.resource_type)} #{_('Analysis')}"))
    end

    data[:rows] = rows
    miq_structured_list(data)
  end

  def settings_schedule_filter_details(schedule, exp_table)
    data = {
      :title => _('Filter'),
      :mode  => "settings_schedule_filter_details",
    }

    rows = []
    unless schedule.sched_action[:method] == "automation_request"
      if schedule.miq_search
        search = schedule.miq_search
        filter_data = search.search_type == "user" ? `_("My Filter: ") #{search.description}` : `_("Global Filter: ") #{search.description}`
        rows.push({:cells => [{:value => filter_data}]})
      elsif schedule.filter.kind_of?(MiqExpression)
        operators = ["AND", "OR", "(", ")"]
        exp_table.each do |token|
          if operators.exclude?([token].flatten.first)
            rows.push({:cells => [{:value => [token].flatten.first}]})
          else
            rows.push({:cells => [{:value => [token].flatten.first, :style => 'color_black'}]})
          end
        end
      else
        rows.push({:cells => [{:value => MiqExpression.to_human(schedule.expression)}]})
      end
    end

    data[:rows] = rows
    miq_structured_list(data)
  end

  def settings_schedule_object_details(schedule)
    rows = [
      row_data(_('System/Process'), schedule.filter[:uri_parts][:instance]),
      row_data(_('Message'), schedule.filter[:uri_parts][:message]),
    ]

    if schedule.next_run_on.present?
      rows.push(row_data(_('Request'), schedule.filter[:uri_parts][:message]))
    else
      rows.push(row_data(_('Request'), ''))
    end

    miq_structured_list(
      :title => _('Object Details'),
      :mode  => "settings_schedule_object_details",
      :rows  => rows
    )
  end

  def settings_schedule_object_attribute(object_class, object_name)
    miq_structured_list(
      :title => _('Object Attribute'),
      :mode  => "settings_schedule_object_attribute",
      :rows  => [
        row_data(_('Object Type'), object_class),
        row_data(_('Object Selection'), object_name),
      ]
    )
  end

  def settings_schedule_attribute_value_pairs(schedule)
    rows = []
    schedule.filter[:ui][:ui_attrs].each_with_index do |attr, i|
      if attr
        rows.push({:cells => [{:value => (i + 1).to_s}, {:value => attr[0]}, {:value => attr[1]}]})
      else
        rows.push({:cells => [{:value => (i + 1).to_s}]})
      end
    end
    miq_structured_list(
      :title => _('Attribute/Value Pairs'),
      :mode  => "settings_attribute_value_pairs",
      :rows  => rows
    )
  end
end
