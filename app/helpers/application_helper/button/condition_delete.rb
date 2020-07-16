class ApplicationHelper::Button::ConditionDelete < ApplicationHelper::Button::Condition
  needs :@record

  def data(data)
    t = {:condition_type => ui_lookup(:model => @record.towhat)}
    data['function-data']['modal_title'] = _('Delete %{condition_type} Condition') % t
    data['function-data']['modal_text'] = _("Are you sure you want to delete this %{condition_type} Condition?") % t
    data
  end

  def disabled?
    @error_message = _('Conditions assigned to Policies can not be deleted') if !@record.miq_policies.empty?
    @error_message.present?
  end
end
