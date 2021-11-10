class ApplicationHelper::Button::NewHostAggregate < ApplicationHelper::Button::ButtonNewDiscover
  def supports_button_action?
    supported_types = HostAggregate.descendants.select { |klass| klass.supports?(:create) }.map(&:module_parent).map(&:name)
    Rbac::Filterer.filtered(ManageIQ::Providers::CloudManager.where(:type => supported_types)).any?
  end

  def disabled?
    @error_message = _("No cloud provider supports creating host aggregates.") unless supports_button_action?
    super || @error_message.present?
  end
end
