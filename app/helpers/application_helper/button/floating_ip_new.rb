class ApplicationHelper::Button::FloatingIpNew < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    Rbac::Filterer.filtered(FloatingIp.providers_supporting(:create)).any?
  end

  def disabled?
    @error_message = _("No cloud providers support creating floating IPs.") unless supports_button_action?
    super || @error_message.present?
  end
end
