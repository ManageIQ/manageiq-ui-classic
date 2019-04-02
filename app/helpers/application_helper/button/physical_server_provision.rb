class ApplicationHelper::Button::PhysicalServerProvision < ApplicationHelper::Button::Basic
  def disabled?
    disabled = true
    if EmsPhysicalInfra.count.zero?
      @error_message = _('No Physical Infrastructure Provider that supports VM provisioning added')
    elsif PhysicalServer.count.zero?
      @error_message = _('No Physical Servers that support VM provisioning available')
    elsif EmsPhysicalInfra.all.none?(&:supports_provisioning?)
      @error_message = _('No Physical Infrastructure Providers that support VM provisioning available')
    else
      disabled = false
    end
    disabled
  end
end
