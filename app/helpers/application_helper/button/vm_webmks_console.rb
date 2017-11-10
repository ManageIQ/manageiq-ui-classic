class ApplicationHelper::Button::VmWebmksConsole < ApplicationHelper::Button::VmConsole
  include VmwareConsoleHelper
  needs :@record

  def visible?
    console_supports_type?('WebMKS') if vmware? && @record.console_supported?('WebMKS')
  end

  def disabled?
    @error_message = _("The web-based WebMKS console is not available because the required libraries aren't installed") unless webmks_assets_provided?
    @error_message = _('The web-based WebMKS console is not available because the VM is not powered on') unless on?
    @error_message.present?
  end
end
