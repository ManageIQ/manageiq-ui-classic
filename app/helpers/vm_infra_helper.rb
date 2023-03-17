module VmInfraHelper
  include VmHelper
  include DataTableHelper

  # rubocop:disable Rails/HelperInstanceVariable
  def reconfigure_form_data(vm = @reconfigitems.first)
    {
      :recordId  => @reconfigitems.collect(&:id),
      :requestId => @request_id || 'new',
      :roles     => {
        :allowMemoryChange   => role_allows?(:feature => 'vm_reconfigure_memory'),
        :allowCpuChange      => role_allows?(:feature => 'vm_reconfigure_cpu'),
        :allowDiskChange     => role_allows?(:feature => 'vm_reconfigure_disks') && item_supports?(:reconfigure_disks),
        :allowDiskSizeChange => item_supports?(:reconfigure_disksize),
        :allowNetworkChange  => item_supports?(:reconfigure_network_adapters) && role_allows?(:feature => 'vm_reconfigure_networks'),
        :allowCdromsChange   => item_supports?(:reconfigure_cdroms) && role_allows?(:feature => 'vm_reconfigure_drives'),
        :isVmwareInfra       => vm.vendor == 'vmware' && vm.type.include?('InfraManager'),
        :isVmwareCloud       => vm.vendor == 'vmware' && vm.type.include?('CloudManager'),
        :isRedhat            => vm.vendor == 'redhat',
      },
      :memory    => {
        :min     => @reconfig_limits[:min__vm_memory],
        :max     => @reconfig_limits[:max__vm_memory],
        :max_cpu => @reconfig_limits[:max__total_vcpus],
      },
      :options   => {
        :controller_types    => @reconfigitems.first.try(:scsi_controller_types) || [],
        :vlan_options        => @vlan_options || [],
        :avail_adapter_names => @avail_adapter_names || [],
        :host_file_options   => @iso_options || [],
        :socket_options      => @socket_options || [],
        :cores_options       => @cores_options || [],
      }
    }
  end
  # rubocop:enable Rails/HelperInstanceVariable
end
