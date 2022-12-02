module MiqPolicyHelper
  # Snapshot ages for delete_snapshots_by_age action type
  SNAPSHOT_AGES = {}
  (1..23).each { |a| SNAPSHOT_AGES[a.hours.to_i] = (a.to_s + (a < 2 ? _(" Hour") : _(" Hours"))) }
  (1..6).each { |a| SNAPSHOT_AGES[a.days.to_i] = (a.to_s + (a < 2 ? _(" Day") : _(" Days"))) }
  (1..4).each { |a| SNAPSHOT_AGES[a.weeks.to_i] = (a.to_s + (a < 2 ? _(" Week") : _(" Weeks"))) }
  SNAPSHOT_AGES.freeze

  def miq_summary_policy_basic_information(record)
    rows = []
    data = {:title => _('Basic Information'), :mode => "miq_policy_basic_information"}
    rows.push({:cells => {:label => _('Active'), :value => record.active ? _("Yes") : _("No")}})
    rows.push({:cells => {:label => _('Created'), :value => _("By Username %{username} %{created_on}") % {:username => record.created_by || _("N/A"), :created_on => format_timezone(record.created_on, session[:user_tz], "gtl")}}})
    if @record.created_on != @record.updated_on
      rows.push({:cells => {:label => _("Last Updated"), :value => _("By Username %{username} %{updated_on}") % {:username => record.updated_by || _("N/A"), :updated_on => format_timezone(record.updated_on, session[:user_tz], "gtl")}}})
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_policy_scope(expression_table)
    rows = []
    data = {:title => _('Scope'), :mode => "miq_policy_scope"}
    if !expression_table.nil?
      expression_table.each do |token|
        rows.push({:cells => {:label => _(''), :value => [token].flatten.first}})
      end
    else
      data[:message] = _("No Policy scope defined, the scope of this policy includes all elements.")
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_policy_conditions(policy_conditions)
    rows = []
    data = {:title => _("Conditions"), :mode => "miq_policy_conditions"}
    data[:headers] = [_("Description"), _("Scopes / Expressions")]
    if policy_conditions.empty?
      data[:message] = _("No conditions defined. This policy is unconditional and will ALWAYS return true.")
    else
      policy_conditions.each do |c|
        cells = [{:icon => c.decorate.fonticon, :value => c.description}]
        value = []
        if c.applies_to_exp.present?
          value.push({:label => _("Scope"), :value => MiqExpression.to_human(c.applies_to_exp)})
        end
        value.push({:label => _("Expression"), :value => MiqExpression.to_human(c.expression)})
        cells.push(value)
        rows.push({
                    :cells   => cells,
                    :title   => "View this Condition",
                    :onclick => "DoNav('/condition/show/#{c.id}');",
                  })
      end
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_policy_events(policy_events, record)
    data = {:title => _("Events"), :mode => "miq_policy_events"}
    data[:headers] = [_('Description'), _('Actions')]
    rows = []
    if policy_events.empty?
      data[:message] = _("This policy does not currently respond to any Events.")
    else
      policy_events.each do |e|
        obj = {}
        obj['cells'] = [{
          :icon    => e.decorate.try(:fonticon),
          :value   => e.description,
          :title   => _("View this Event"),
          :onclick => "DoNav('/miq_event_definition/show/#{e.id}');"
        }]
        values = []
        ta = record.actions_for_event(e, :success)
        ta.each do |a|
          values.push({:value => {
                        :icon    => "pficon pficon-ok",
                        :value   => a.description,
                        :title   => _("View this Action"),
                        :onclick => "DoNav('/miq_action/show/#{a.id}');"
                      }})
        end
        fa = record.actions_for_event(e, :failure)
        fa.each do |a|
          values.push({:value => {
                        :icon    => "pficon pficon-close",
                        :value   => a.description,
                        :title   => _("View this Action"),
                        :onclick => "DoNav('/miq_action/show/#{a.id}');"
                      }})
        end
        obj['cells'].push(values)
        rows.push(obj)
      end
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_policy_notes(record)
    rows = []
    data = {:title => _('Notes'), :mode => "miq_policy_notes"}
    if record.notes.blank?
      data[:message] = _("No notes have been entered.")
    else
      rows.push({:cells => {:value => {:input => "text_area", :text=> record.notes, :readonly => true, :rows => 4 }}})
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_profiles(policy_profiles)
    rows = []
    data = {:title => _("Belongs to Profiles"), :mode => "miq_policy_profiles"}
    if policy_profiles.empty?
      data[:message] = _("This Policy is not assigned to any Profiles.")
    else
      policy_profiles.each do |policy|
        rows.push({
                    :cells   => [{:icon => policy.decorate.fonticon, :value => policy.description}],
                    :title   => _("View this Policy Profile"),
                    :onclick => "DoNav('/miq_policy_set/show/#{policy.id}');",
                  })
      end
    end
    data[:rows] = rows
    miq_structured_list(data)
  end
end
