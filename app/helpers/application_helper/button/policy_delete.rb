class ApplicationHelper::Button::PolicyDelete < ApplicationHelper::Button::PolicyButton
  needs :@record

  def data(data)
    t = {:policy_type => ui_lookup(:model => @record.towhat)}
    data['function-data']['modal_title'] = _('Delete %{policy_type} Policy') % t
    data['function-data']['modal_text'] = _("Are you sure you want to delete this %{policy_type} Policy?") % t
    data
  end

  def disabled?
    super
    @error_message ||= _('Policies that belong to Profiles can not be deleted') unless @policy.memberof.empty?
    @error_message.present?
  end
end
