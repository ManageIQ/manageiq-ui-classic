class ApplicationHelper::Button::InstanceMiqRequestNew < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    @error_message = _('No Cloud Provider that supports instance provisioning added') unless provisioning_supported?
    @error_message.present?
  end

  private

  def provisioning_supported?
    # TODO: EmsCloud.supporting(:provisioning).any?
    EmsCloud.all.any? { |ems| ems.supports?(:provisioning) }
  end
end
