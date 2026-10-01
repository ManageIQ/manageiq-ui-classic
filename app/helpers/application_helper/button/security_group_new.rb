class ApplicationHelper::Button::SecurityGroupNew < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    Rbac::Filterer.filtered(SecurityGroup.providers_supporting(:create)).any?
  end

  def disabled?
    @error_message = _("No cloud providers support creating security groups.") unless supports_button_action?
    super || @error_message.present?
  end
end
