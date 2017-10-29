class ApplicationHelper::Button::VmWebmksConsole < ApplicationHelper::Button::VmConsole
  include VmwareConsoleHelper
  needs :@record

  def visible?
    console_supports_type?('WebMKS') if vmware? && @record.console_supported?('WebMKS')
  end

  def disabled?
    canned_msg = _('The web-based WebMKS console is not available because')
    @error_message = _("%{canned_msg} the required libraries aren't installed" % {:canned_msg => canned_msg}) unless webmks_assets_provided?
    @error_message = _("%{canned_msg} the VM is not powered on" % {:canned_msg => canned_msg}) unless on?
    @error_message = _("%{canned_msg} the VM does not support the minimum required vSphere API version." % {:canned_msg => canned_msg}) unless supported_vendor_api?
    @error_message.present?
  end

  def supported_vendor_api?
    ExtManagementSystem.find(@record.ems_id).api_version.to_f >= min_required_api_version
  end

  def min_required_api_version
    6.0
  end
end
