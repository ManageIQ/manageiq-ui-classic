class ApplicationHelper::Button::VmVncConsole < ApplicationHelper::Button::VmConsole
  needs :@record

  def visible?
    return ems? && console_supports_type?('VNC') if vmware?
    @record.console_supported?('vnc')
  end

  def disabled?
    @error_message = if vmware? && !supported_vendor_api?
                       _('VNC consoles are unsupported on VMware ESXi 6.5 and later.')
                     elsif !on?
                       _('The web-based VNC console is not available because the VM is not powered on')
                     end
    @error_message.present?
  end

  private

  def supported_vendor_api?
    return @record.host.vmm_version.to_f < unsupported_api_version unless @record.host.nil?
    false
  end

  def unsupported_api_version
    6.5
  end
end
