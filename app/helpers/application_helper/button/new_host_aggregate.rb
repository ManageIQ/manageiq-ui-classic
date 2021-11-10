class ApplicationHelper::Button::NewHostAggregate < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    Rbac::Filterer.filtered(ManageIQ::Providers::CloudManager).any?(&:supports_create_host_aggregate)
  end

  def disabled?
    @error_message = _("No cloud provider supports creating host aggregates.") unless supports_button_action?
    super || @error_message.present?
  end
end
