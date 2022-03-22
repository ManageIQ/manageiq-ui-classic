module MiqEventDefinitionHelper
  def miq_summary_event_definition_info(record, policy)
    data = {:title => _("Basic Information"), :mode => "miq_event_definition_info"}
    rows = []
    rows.push({:cells => {:label => _("Event Group"), :value => record.memberof.first.description}})
    rows.push({:cells => {:label => _("Attached to Policy"), :value => policy.description}}) if policy
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_event_definition_policies(record_policies)
    rows = []
    data = {:title => _("Assigned to Policies"), :mode => "miq_event_definition_policy"}
    if record_policies.empty?
      data[:message] = _("This Event is not assigned to any Policies.")
    else
      record_policies.each do |ed|
        rows.push({
                    :cells   => [{:icon => ed.decorate.fonticon, :value => ed.description}],
                    :title   => _("View this %{model} Policy") % {:model => ui_lookup(:model => ed.towhat)},
                    :onclick => "DoNav('/miq_policy/show/#{ed.id}');",
                  })
      end
      data[:rows] = rows
    end
    miq_structured_list(data)
  end
end
