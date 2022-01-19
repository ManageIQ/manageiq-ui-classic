module MiqPolicySetHelper
  def miq_summary_policy_set(profile_policies)
    data = {:title => _("Policies"), :mode => "miq_policy_set"}
    rows = []
    if profile_policies.empty?
      data[:message] = _("No Policies are defined.")
    else
      profile_policies.each do |p|
        cells = [{:icon => p.decorate.fonticon, :bold => true, :value => "#{ui_lookup(:model => p.towhat)} #{p.mode.capitalize}"}]
        cells.push(h(p.description))
        rows.push({
                    :cells   => cells,
                    :title   => _("View this %{model} Policy") % {:model => ui_lookup(:model => p.towhat)},
                    :onclick => "DoNav('/miq_policy/show/#{p.id}');"
                  })
      end
      data[:rows] = rows
    end
    miq_structured_list(data)
  end
end
