module HostHelper
  include_concern 'TextualSummary'
  include_concern 'ComplianceSummaryHelper'

  def host_info
    devices = devices_details
    os_info = os_info_details
    vmm_info = vmm_info_details
    [devices, os_info, vmm_info]
  end
end
