module ConditionHelper
  def miq_summary_conditions(condition_policies)
    rows = []
    data = {:title => _("Assigned to Policies"), :mode => "miq_condition"}
    if condition_policies.empty?
      data[:message] = _("This Condition is not assigned to any Policies.")
    else
      condition_policies.each do |cp|
        rows.push(
          {
            :cells   => [{:icon => cp.decorate.fonticon, :value => cp.description}],
            :title   => _("View this %{model} Policy") % {:model => ui_lookup(:model => cp.towhat)},
            :onclick => "DoNav('/miq_policy/show/#{cp.id}');"
          }
        )
      end
    end
    data[:rows] = rows
    miq_structured_list(data)
  end
end
