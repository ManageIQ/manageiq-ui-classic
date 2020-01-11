class ApplicationHelper::Button::VmNativeConsole < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    @record.vendor == 'redhat'
  end

  def disabled?
    begin
      @record.validate_native_console_support
    rescue MiqException::RemoteConsoleNotSupportedError => err
      @error_message = _('VM Native Console error: %{error}') % {:error => err}
    end
    @error_message.present?
  end
end
