module MiqActionHelper
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
