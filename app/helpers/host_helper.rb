module HostHelper
  include_concern 'TextualSummary'
  include_concern 'ComplianceSummaryHelper'

  def get_host_info
    devices = devices_details
    os_info = get_os_info
    vmm_info = get_vmm_info
    [devices, os_info, vmm_info]
  end
end
