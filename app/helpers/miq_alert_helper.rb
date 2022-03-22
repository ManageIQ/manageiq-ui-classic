module MiqAlertHelper
  def miq_summary_alert_info(alert, event, sb_data)
    rows = []
    data = {:title => _('Info'), :mode => "miq_alert_info", :rows => []}
    rows.push({:cells => {:label => _("Description"), :value => alert.description}})
    rows.push({:cells => {:label => _("Active"), :value => alert.enabled ? _("Yes") : _("No")}})
    rows.push({:cells => {:label => _("Severity"), :value => controller.class::SEVERITIES[alert.severity]}})
    rows.push({:cells => {:label => _("Based On"), :value => ui_lookup(:model => alert.db)}})
    evaluate = alert.expression.kind_of?(MiqExpression) ? _('Expression') : _(MiqAlert.expression_types(alert.db)[alert.expression[:eval_method]])
    rows.push({:cells => {:label => _("What to Evaluate"), :value => evaluate}})
    if (alert.expression.kind_of?(MiqExpression) || alert.expression[:eval_method] == "nothing") && ['ContainerNode', 'ContainerProject'].exclude?(alert.db)
      rows.push({:cells => {:label => _("Driving Event"), :value => event}})
    end

    if alert.options[:notifications][:delay_next_evaluation].blank?
      next_evaluation = _('10 Minutes')
    elsif alert.options[:notifications][:delay_next_evaluation].zero?
      # hide = true
    else
      next_evaluation = sb_data[:alert][:repeat_times][alert.options[:notifications][:delay_next_evaluation]]
    end
    rows.push({:cells => {:label => _("Notification Frequency"), :value => next_evaluation}})

    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_alert_expression(expression_table)
    rows = []
    data = {:title => _('Expression'), :mode => "miq_alert_expression", :rows => []}
    if !expression_table.nil?
      expression_table.each do |token|
        if ["AND", "OR", "(", ")"].exclude?([token].flatten.first)
          rows.push({:cells => {:value => [token].flatten.first}})
        else
          rows.push({:cells => {:value => [token].flatten.first, :style => {:color => "black"}}})
        end
      end
    else
      data[:message] = _("An alert must contain a valid expression.")
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_alert_parameters(alert, expression_options, sb_data, perf_column_unit, ems)
    rows = []
    title = [_(MiqAlert.expression_types(alert.db)[alert.expression[:eval_method]]), _('Parameters')].join(' ')
    data = {:title => title, :mode => "miq_alert_parameters", :rows => []}
    ae_options = alert.expression[:options]
    expression_options&.each do |option|
      row_data = {:cells => {:label => _(option[:description])}}
      case option[:name]
      when :event_types
        row_data[:cells][:value] = ae_options[:event_types].nil? ? _("No type set") : sb_data[:alert][:events][ae_options[:event_types].first]
      when :time_threshold
        row_data[:cells][:value] = sb_data[:alert][:time_thresholds][ae_options[:time_threshold]]
      when :hourly_time_threshold
        row_data[:cells][:value] = sb_data[:alert][:hourly_time_thresholds][ae_options[:hourly_time_threshold]]
      when :rt_time_threshold
        row_data[:cells][:value] = sb_data[:alert][:rt_time_thresholds][ae_options[:rt_time_threshold]]
      when :operator, :value_threshold
        # Skip these, they are handled by perf_column
      when :perf_column
        row_data[:cells][:value] = [{:value => option[:values][alert.db][ae_options[:perf_column]]},
                                    {:value => ae_options[:operator]},
                                    {:value => ae_options[:value_threshold]}]
      when :trend_steepness
        # Skip, handled by trend_direction
      when :trend_direction
        trend_direction_data = [{:value => option[:values][ae_options[:trend_direction] || "none"]}]
        if ae_options[:trend_direction].to_s.ends_with?("more_than")
          trend_direction_data.push({:value => ae_options[:trend_steepness]})
          trend_direction_data.push({:value => perf_column_unit})
          trend_direction_data.push({:value => _('Per Minute')})
        end
        row_data[:cells][:value] = trend_direction_data
      when :debug_trace
        row_data[:cells][:value] = ae_options[:debug_trace]
      when :event_log_message_filter_value
        # Skip this, handled by event_log_message_filter_type
      when :event_log_message_filter_type
        row_data[:cells][:label] = _('Message Filter')
        row_data[:cells][:value] = [{:value => ae_options[:event_log_message_filter_type]},
                                    {:value => ae_options[:event_log_message_filter_value]}]
      when :hdw_attr
        row_data[:cells][:label] = _('Hardware Attribute')
        row_data[:cells][:value] = [{:value => Dictionary.gettext(ae_options[:hdw_attr].to_s, :type => "column")},
                                    {:value => ae_options[:operator]}]
      when :ems_id
        if ems.blank?
          row_data[:cells][:value] = _("Provider no longer exists, this alert must be reconfigured")
          row_data[:cells][:style] = {:style => "color: red;"}
        else
          row_data[:cells][:value] = ems.name
        end
      when :ems_alarm_mor
        if ems
          # Show if editing or a valid EMS is configured
          row_data[:cells][:value] = ae_options[:ems_alarm_name]
        end
      when :mw_operator
        # Skip this, handled by value_mw_garbage_collector
      when :value_mw_threshold
        row_data[:cells][:value] = [{:value => ae_options[:mw_operator]},
                                    {:value => ae_options[:value_mw_threshold]}]
      when :value_mw_garbage_collector
        row_data[:cells][:value] = [{:value => ae_options[:mw_operator]},
                                    {:value => ae_options[:value_mw_garbage_collector]}]
      else
        # Set up as a text input field
        row_data[:cells][:value] = ae_options[option[:name]]
      end
      rows.push(row_data)
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_alert_send_email(alert, email_to)
    alert_options = alert.options
    if alert_options && alert_options[:notifications] && alert.options[:notifications][:email].present?
      rows = []
      data = {:title => _('Send E-mail'), :mode => "miq_alert_send_email", :rows => []}
      from_email = if alert_options[:notifications][:email][:from].present?
                     _("(Default: %{email_from})") % {:email_from => h(::Settings.smtp.from)}
                   else
                     alert_options[:notifications][:email][:from]
                   end
      rows.push({:cells => {:label => _('From'), :value => from_email}})
      rows.push({:cells => {:label => _('To'), :value => email_to.blank? ? '' : email_to.join(';')}})
      data[:rows] = rows
      miq_structured_list(data)
    end
  end

  def miq_summary_alert_send_sms(alert)
    alert_options = alert.options
    if alert_options && alert_options[:notifications] && alert_options[:notifications][:snmp].present?
      data = {:title => _('Send SNMP Trap'), :mode => "miq_alert_send_sms", :rows => []}
      rows = []
      host_data = {:cells => {:label => _('Host')}}
      host_value = []
      alert_options[:notifications][:snmp][:host].each do |host|
        host_value.push({:value => host})
      end
      host_data[:cells][:value] = host_value
      rows.push(host_data)

      snmp_version = alert_options[:notifications][:snmp][:snmp_version]
      rows.push({:cells => {:label => _('Version'), :value => snmp_version}})

      trap_label = snmp_version == "v1" || snmp_version.nil? ? _("Trap Number") : _("Trap Object ID")
      rows.push({:cells => {:label => trap_label, :value => alert_options[:notifications][:snmp][:trap_id]}})
      data[:rows] = rows
      miq_structured_list(data)
    end
  end

  def miq_summary_alert_variable(alert)
    alert_options = alert.options
    if alert_options[:notifications][:snmp].key?(:variables)
      labels = [_('Variable Object ID'), _('Type'), _('Value')]
      data = {:title => _('Variables'), :mode => "miq_alert_variable", :labels => labels, :rows => []}
      rows = []
      alert_options[:notifications][:snmp][:variables].each do |var|
        rows.push([var[:oid], var[:var_type], var[:value]])
      end
      data[:rows] = rows
      miq_structured_list(data)
    end
  end

  def miq_summary_alert_timeline_event(alert)
    alert_options = alert.options
    if alert_options && alert_options[:notifications] && alert_options[:notifications][:evm_event]
      data = {:title => _('Timeline Event'), :mode => "miq_alert_timeline_event", :rows => []}
      rows = [{:cells => {:label => _('Show on Timeline'), :value => _('True')}}]
      data[:rows] = rows
      miq_structured_list(data)
    end
  end

  def miq_summary_alert_management_event(alert)
    alert_options = alert.options
    if alert_options && alert_options[:notifications] && alert_options[:notifications][:automate].present?
      data = {:title => _('Send Management Event'), :mode => "miq_alert_management_event", :rows => []}
      rows = [{:cells => {:label => _('Event Name'), :value => alert_options[:notifications][:automate][:event_name]}}]
      data[:rows] = rows
      miq_structured_list(data)
    end
  end

  def miq_summary_belongs_to_alert_profile(alert_profiles)
    rows = []
    data = {:title => _('Belongs to Alert Profiles'), :mode => "miq_alert_profiles", :rows => []}
    if alert_profiles.blank?
      data[:message] = _("This Alert is not assigned to any Alert Profiles.")
    else
      alert_profiles.each do |ap|
        rows.push({
                    :cells   => [{:icon => 'pficon pficon-warning-triangle-o', :value => h(ap.description)}],
                    :title   => _("View this Alert Profile"),
                    :onclick => "DoNav('/miq_alert_set/show/#{ap.id}');",
                  })
      end
      data[:rows] = rows
    end
    miq_structured_list(data)
  end

  def miq_summary_alert_referenced(alert)
    unless alert.owning_miq_actions.empty?
      rows = []
      data = {:title => _('Referenced by Actions'), :mode => "miq_alert_referenced", :rows => []}
      if alert.owning_miq_actions.empty?
        data[:message] = _("This Alert is not referenced by any Actions.")
      else
        alert.owning_miq_actions.each do |oa|
          rows.push({
                      :cells   => [{:icon => oa.decorate.fonticon, :value => oa.description}],
                      :title   => _("View this Action"),
                      :onclick => "DoNav('/miq_action/show/#{oa.id}');",
                    })
        end
        data[:rows] = rows
      end
      miq_structured_list(data)
    end
  end
end
