describe HostHelper::TextualSummary do
  before do
    instance_variable_set(:@record, FactoryBot.create(:host_openstack_infra,
                                                       :type => ManageIQ::Providers::Openstack::InfraManager::Host))
    allow(self).to receive(:textual_authentications).and_return([])
    allow(::Settings).to receive_message_chain(:product, :proto).and_return("")
    allow(self).to receive(:textual_openstack_nova_scheduler).and_return([])
  end

  include_examples "textual_group", "Properties", %i(
    hostname
    ipaddress
    ipmi_ipaddress
    hypervisor_hostname
    custom_1
    vmm_info
    model
    asset_tag
    service_tag
    osinfo
    power_state
    lockdown_mode
    maintenance_mode
    devices
    network
    storage_adapters
    num_cpu
    num_cpu_cores
    cpu_cores_per_socket
    memory
    guid
  )

  include_examples "textual_group", "Relationships", %i(
    ems
    cluster
    availability_zone
    used_tenants
    storages
    resource_pools
    vms
    templates
    drift_history
    physical_server
    network_manager
    custom_button_events
    cloud_networks
    cloud_subnets
  )

  include_examples "textual_group", "Security", %i(users groups patches firewall_rules ssh_root)

  include_examples "textual_group", "Configuration", %i(guest_applications host_services filesystems advanced_settings)

  include_examples "textual_group", "Diagnostics", %i(esx_logs)

  include_examples "textual_group_smart_management"

  include_examples "textual_group", "Custom Attributes", nil, "miq_custom_attributes"

  include_examples "textual_group", "VC Custom Attributes", nil, "ems_custom_attributes"

  include_examples "textual_group", "Authentication Status", [], "authentications"

  include_examples "textual_group", "Cloud Services", [], "cloud_services"

  include_examples "textual_group", "Openstack Hardware", %i(introspected provision_state), "openstack_hardware_status"
end
