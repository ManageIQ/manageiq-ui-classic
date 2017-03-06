class ApplicationHelper::Button::VmConsole < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    console_supports_type?('MKS')
  end

  def disabled?
    unless supported_browser? && supported_os?
      @error_message = _('The web-based console is only available on IE, Firefox or Chrome (Windows/Linux)')
      return true
    end

    yield if block_given?
    return true if @error_message.present?

    @error_message = _('The web-based console is not available because the VM is not powered on') unless on?
    @error_message.present?
  end

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

  def supported_browser?
    @view_context.is_browser?(%w(explorer firefox mozilla chrome))
  end

  def supported_os?
    @view_context.is_browser_os?(%w(windows linux))
  end
end
