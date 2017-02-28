class ApplicationHelper::Button::HostMiqRequestNew < ApplicationHelper::Button::ButtonNewDiscover
  needs :@record

  def disabled?
    @error_message = _("No PXE Servers are available for Host provisioning") if PxeServer.count <= 0
    @error_message = _("This Host can not be provisioned because the MAC address is not known") unless @record.mac_address
    @error_message.present?
  end
end
