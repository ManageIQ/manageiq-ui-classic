class ApplicationHelper::Button::VmVmrcConsole < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.vendor == 'vmware'
  end

  def disabled?
    begin
      @record.validate_remote_console_vmrc_support
    rescue MiqException::RemoteConsoleNotSupportedError => err
      @error_message = _('VM VMRC Console error: %{error}') % {:error => err}
    end
    @error_message.present?
  end
end
