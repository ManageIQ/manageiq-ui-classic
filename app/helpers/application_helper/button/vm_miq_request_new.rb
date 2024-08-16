class ApplicationHelper::Button::VmMiqRequestNew < ApplicationHelper::Button::ButtonNewDiscover
  def disabled?
    @error_message = _('No Infrastructure Provider that supports VM provisioning added') unless provisioning_supported?
    @error_message.present?
  end

  private

  def provisioning_supported?
    # TODO: EmsCloud.supporting(:provisioning).any?
    EmsInfra.all.any? { |ems| ems.supports?(:provisioning) }
  end
end
