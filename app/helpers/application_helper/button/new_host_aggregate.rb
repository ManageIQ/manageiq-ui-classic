class ApplicationHelper::Button::NewHostAggregate < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    filtered_providers = Rbac::Filterer.filtered(ManageIQ::Providers::CloudManager)
    filtered_providers.any? { |ems| ems.supports?(:create_host_aggregate) }
  end

  def disabled?
    @error_message = _("No cloud provider supports creating host aggregates.") unless supports_button_action?
    super || @error_message.present?
  end
end
