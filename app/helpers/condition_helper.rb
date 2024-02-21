module ConditionHelper
  def miq_summary_condition_info(condition, edit)
    data = {:title => _("Basic Information"), :mode => "miq_condition_info"}
    rows = []
    rows.push({:cells => {:label => _("Description"), :value => condition.description}})
    rows.push({:cells => {:label => _("Applies To"), :value => Condition::TOWHAT_APPLIES_TO_CLASSES[edit ? edit[:new][:towhat] : condition.towhat]}})
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_condition_scope(applies_to_exp_table)
    rows = []
    data = {:title => _('Scope'), :mode => "miq_condition_scope"}
    if !applies_to_exp_table.nil?
      applies_to_exp_table.each do |token|
        if ["AND", "OR", "(", ")"].exclude?([token].flatten.first)
          rows.push({:cells => {:label => _(''), :value => [token].flatten.first}})
        else
          rows.push({:cells => {:label => _(''), :value => [token].flatten.first, :style => 'color_black'}})
        end
      end
    else
      data[:message] = _("No scope defined, the scope of this condition includes all elements.")
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_condition_expression(expression_table)
    rows = []
    data = {:title => _('Expression'), :mode => "miq_condition_expression"}
    if !expression_table.nil?
      expression_table.each do |token|
        if ["AND", "OR", "(", ")"].exclude?([token].flatten.first)
          rows.push({:cells => {:label => _(''), :value => [token].flatten.first}})
        else
          rows.push({:cells => {:label => _(''), :value => [token].flatten.first, :style => 'color_black'}})
        end
      end
    else
      data[:message] = _("A condition must contain a valid expression.")
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_conditions_policies(condition_policies)
    rows = []
    data = {:title => _("Assigned to Policies"), :mode => "miq_condition_policies"}
    if condition_policies.empty?
      data[:message] = _("This Condition is not assigned to any Policies.")
    else
      condition_policies.each do |cp|
        rows.push(
          {
            :cells   => [{:icon => cp.decorate.fonticon, :value => cp.description}],
            :title   => _("View this %{model} Policy") % {:model => ui_lookup(:model => cp.towhat)},
            :onclick => {:url => "/miq_policy/show/#{cp.id}"},
          }
        )
      end
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def miq_summary_condition_notes(condition, _condition_policies)
    data = {:title => _("Notes"), :mode => "miq_condition_notes", :rows => []}
    if condition.notes.blank?
      data[:message] = _("No notes have been entered.")
    else
      data[:rows] = [{:cells => {:value => {:input => "text_area", :text => condition.notes, :readonly => true, :rows => 4}}}]
    end
    miq_structured_list(data)
  end
end
