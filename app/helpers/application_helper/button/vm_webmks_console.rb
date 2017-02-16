class ApplicationHelper::Button::VmWebmksConsole < ApplicationHelper::Button::VmConsole
  needs :@record

  def visible?
    @record.console_supported?('WebMKS')
  end

  def disabled?
    @error_message = _('The web-based console is not available because the VM is not powered on') unless on?
    @error_message.present?
  end
end
