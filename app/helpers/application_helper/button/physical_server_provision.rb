class ApplicationHelper::Button::PhysicalServerProvision < ApplicationHelper::Button::Basic
  def disabled?
    if EmsPhysicalInfra.count.zero?
      @error_message = _('No Physical Infrastructure Provider that supports VM provisioning added')
    elsif PhysicalServer.count.zero?
      @error_message = _('No Physical Servers that support VM provisioning available')
    # TODO: EmsPhysicalInfra.supporting(:provisioning).none?
    # TODO: stepping stone needed for above: EmsPhysicalInfra.all.none? { |ems| ems.class.supports?(:provisioning) }
    elsif EmsPhysicalInfra.all.none? { |ems| ems.supports?(:provisioning) }
        @error_message = _('No Physical Infrastructure Providers that support VM provisioning available')
    end
    @error_message.present?
  end
end
