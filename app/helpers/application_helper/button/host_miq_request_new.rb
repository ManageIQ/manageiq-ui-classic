class ApplicationHelper::Button::HostMiqRequestNew < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    count = PxeServer.all.size
    @error_message = N_("No PXE Servers are available for Host provisioning") if count <= 0
    @error_message = N_("This Host can not be provisioned because the MAC address is not known") unless @record.mac_address
    @error_message.present?
  end
end
