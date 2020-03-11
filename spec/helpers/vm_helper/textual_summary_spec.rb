describe VmHelper::TextualSummary do
  include TextualSummaryHelper

  it "#textual_server" do
    server  = FactoryBot.build(:miq_server)
    @record = FactoryBot.build(:vm_vmware, :miq_server => server)
    expect(helper.textual_server).to eq("#{server.name} [#{server.id}]")
  end

  before do
    instance_variable_set(:@record, FactoryBot.create(:vm))
    allow(self).to receive(:textual_key_value_group).and_return([])
  end

  include_examples "textual_group", "Properties", %i(
    id
    name
    region
    server
    description
    hostname
    ipaddress
    mac_address
    custom_1
    container
    host_platform
    tools_status
    load_balancer_health_check_state
    osinfo
    devices
    cpu_affinity
    snapshots
    advanced_settings
    resources
    guid
    storage_profile
  )

  include_examples "textual_group", "Lifecycle", %i(
    discovered
    analyzed
    retirement_date
    retirement_state
    provisioned
    owner
    group
  )

  include_examples "textual_group", "Relationships", %i(
    ems
    cluster
    host
    resource_pool
    storage
    service
    parent_vm
    genealogy
    drift
    scan_history
    cloud_network
    cloud_subnet
    custom_button_events
  )

  include_examples "textual_group", "Relationships", %i(
    ems
    ems_infra
    cluster
    host
    availability_zone
    cloud_tenant
    flavor
    vm_template
    drift
    scan_history
    service
    genealogy
    cloud_network
    cloud_subnet
    orchestration_stack
    cloud_networks
    cloud_subnets
    network_routers
    security_groups
    floating_ips
    network_ports
    cloud_volumes
    custom_button_events
  ), "vm_cloud_relationships"

  include_examples "textual_group", "Relationships", %i(ems parent_vm genealogy drift scan_history cloud_tenant custom_button_events),
                   "template_cloud_relationships"

  include_examples "textual_group", "Security", %i(users groups patches)

  include_examples "textual_group", "Datastore Allocation Summary", %i(
    disks
    disks_aligned
    thin_provisioned
    allocated_disks
    allocated_total
  ), "datastore_allocation"

  include_examples "textual_group", "Datastore Actual Usage Summary", %i(
    usage_disks
    usage_snapshots
    usage_disk_storage
    usage_overcommitted
  ), "datastore_usage"

  include_examples "textual_group", "Labels", []
end
