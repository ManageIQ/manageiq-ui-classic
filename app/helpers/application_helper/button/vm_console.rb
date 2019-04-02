class ApplicationHelper::Button::VmConsole < ApplicationHelper::Button::Basic
  needs :@record

  private

  def vmware?
    @record.vendor == 'vmware'
  end

  def ems?
    @record.ems_id
  end

  def console_supports_type?(supported_type)
    ::Settings.server.remote_console_type == supported_type ? @record.console_supported?(supported_type) : false
  end

  def on?
    @record.current_state == 'on'
  end
end
