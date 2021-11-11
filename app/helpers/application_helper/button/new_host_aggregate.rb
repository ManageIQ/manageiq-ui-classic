class ApplicationHelper::Button::NewHostAggregate < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    Rbac::Filterer.filtered(HostAggregate.providers_supporting(:create)).any?
  end

  def disabled?
    @error_message = _("No cloud provider supports creating host aggregates.") unless supports_button_action?
    super || @error_message.present?
  end
end
