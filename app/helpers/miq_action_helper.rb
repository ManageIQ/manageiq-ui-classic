module MiqActionHelper
  def miq_summary_action_info(record)
    data = {:title => _("Basic Information"), :mode => "miq_action_info"}
    rows = []
    rows.push({:cells => {:label => _("Description"), :value => record.description}})
    rows.push({:cells => {:label => _("Action Type"), :value => record.action_type == "default" ? _('Default') : _(MiqAction::TYPES[record.action_type])}})
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_action_type(record, alert_guids, cats)
    record_options = record.options
    data = {:mode => "miq_action_type", :rows => [], :title => ""}
    rows = []
    case record.action_type
    when "create_snapshot"
      data[:title] = _('Snapshot Settings')
      rows.push({:cells => {:label => _('Name'), :value => record_options[:name]}})
    when "delete_snapshots_by_age"
      data[:title] = _('Snapshot Age Settings')
      rows.push({:cells => {:label => _('Delete if older than'), :value => MiqPolicyHelper::SNAPSHOT_AGES[record_options[:age]]}})
    when "custom_automation"
      data[:title] = _('Custom Automation')
      rows.push({:cells => {:label => _('Object Details')}})
      rows.push({:cells => {:label => _('Starting Message'), :value => record_options[:ae_message]}})
      rows.push({:cells => {:label => _('Request'), :value => record_options[:ae_request]}})

      value_pair = []
      if record_options[:ae_hash].present?
        record_options[:ae_hash].each do |k, v|
          value_pair.push({:label => k})
          value_pair.push({:label => v})
        end
      else
        value_pair.push({:label => _('No Attribute/Value Pairs found')})
      end
      rows.push({:cells => {:label => _('Attribute/Value Pairs'), :value => value_pair}})

    when "email"
      data[:title] = _('E-mail Settings')
      rows.push({:cells => {:label => _('From E-mail Address'), :value => record_options[:from]}})
      rows.push({:cells => {:label => _('To E-mail Address'), :value => record_options[:to]}})

    when "set_custom_attribute"
      data[:title] = _('Set Custom Attribute Settings')
      rows.push({:cells => {:label => _('Attribute Name'), :value => record_options[:attribute]}})
      rows.push({:cells => {:label => _("Value to Set"), :value => record_options[:value]}})

    when "reconfigure_cpus"
      data[:title] = _("Reconfigure CPU")
      rows.push({:cells => {:label => _("Number of CPU's"), :value => record_options[:value]}})

    when "reconfigure_memory"
      data[:title] = _("Reconfigure Memory")
      rows.push({:cells => {:label => _("Memory Size"), :value => "#{record_options[:value]} MB"}})

    when "tag"
      data[:title] = _("Applied Tag")
      rows.push({:cells => {:label => _("Tag"), :value => Classification.tag2human(record_options[:tags].first)}})

    when "snmp_trap"
      data[:title] = _("SNMP Trap")
      rows.push({:cells => {:label => _("Host"), :value => record_options[:host]}})
      rows.push({:cells => {:label => _("Version"), :value => record_options[:snmp_version]}})

      trap_text = record_options[:snmp_version] == "v1" || record_options[:snmp_version].nil? ? _("Trap Number") : _("Trap Object ID")
      rows.push({:cells => {:label => trap_text, :value => record_options[:trap_id]}})

      rows.push({:cells => {:label => _("Variables")}})
      if record_options.fetch(:variables, []).empty?
        data[:message] = _('No variables configured.')
      else
        data[:headers] = [_('Object ID'), _('Type'), _('Value')]
        variables_data = []
        record_options[:variables].each do |var|
          next if var[:oid].present?

          variables_data.push({:value => var[:oid]})
          variables_data.push({:value => var[:var_type]})
          variables_data.push({:value => var[:value]})
        end
        data[:values] = variables_data
      end

    when "assign_scan_profile"
      data[:title] = _("Analysis Profile")
      rows.push({:cells => {:label => _("Assigned Analysis Profile"), :value => record_options[:scan_item_set_name]}})

    when "run_ansible_playbook"
      data[:title] = _("Run Ansible Playbook")
      rows.push({:cells => {:label => _("Playbook Catalog Item"), :value => record_options[:service_template_name].join}})

      if record_options[:use_localhost]
        inventory_data = _("Localhost")
      elsif record_options[:use_event_target]
        inventory_data = _("Target Machine")
      else
        _("Specific Hosts ")
        inventory_data =  record_options[:hosts]
      end
      rows.push({:cells => {:label => _("Inventory"), :value => inventory_data}})

    when "evaluate_alerts"
      data[:title] = _("Alerts to Evaluate")
      if alert_guids.empty?
        data[:message] = _("No Alerts have been selected.")
      else
        alert_guids.sort_by(&:description).each do |alert|
          rows.push({
                      :cells   => [{:icon => "pficon pficon-warning-triangle-o", :value => alert.description}],
                      :title   => _("View This Alert"),
                      :onclick => remote_function(:url => "/miq_policy/x_show/al-#{alert.id}?accord=alert"),
                    })
        end
      end
    when "inherit_parent_tags"
      data[:title] = _("Inherit Tags")
      rows.push({:cells => {:label => _("Parent Type"), :value => ui_lookup(:table => record_options[:parent_type])}})
      rows.push({:cells => {:label => _("Categories"), :value => cats}})

    when "remove_tags"
      data[:title] = _("Remove Tags")
      rows.push({:cells => {:label => _("Categories"), :value => cats}})
    end

    miq_structured_list(data) if !data[:title].empty?
  end

  def miq_summary_action_policies(action_policies)
    rows = []
    data = {:title => _("Assigned to Policies"), :mode => "miq_action"}
    if action_policies
      action_policies.each do |ap|
        rows.push({
                    :cells   => [{:icon => ap.decorate.fonticon, :value => ap.description}],
                    :title   => _("View this %{model} Policy"),
                    :onclick => "DoNav('/miq_policy/show/#{ap.id}');",
                  })
      end
      data[:rows] = rows
    else
      data[:message] = _("This Action is not assigned to any Policies.")
    end
    miq_structured_list(data)
  end
end
