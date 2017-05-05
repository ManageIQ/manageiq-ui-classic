class ApplicationHelper::Button::VmConsole < ApplicationHelper::Button::Basic
  needs :@record

  private

  def vmware?
    @record.vendor == 'vmware'
  end

  def supported_vendor_api?
    ExtManagementSystem.find(@record.ems_id).api_version.to_f < unsupported_vendor_api_version
  end

  def console_supports_type?(supported_type)
    ::Settings.server.remote_console_type == supported_type ? @record.console_supported?(supported_type) : false
  end

  def on?
    @record.current_state == 'on'
  end
end
