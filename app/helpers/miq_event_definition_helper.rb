module MiqEventDefinitionHelper
  def miq_summary_event_definition(record_policies)
    rows = []
    data = {:title => _("Assigned to Policies"), :mode => "miq_event_definition"}
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
