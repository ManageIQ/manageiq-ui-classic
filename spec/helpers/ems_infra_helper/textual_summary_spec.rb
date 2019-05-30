describe EmsInfraHelper::TextualSummary do
  before do
    instance_variable_set(:@record, FactoryBot.create(:ems_infra))
    allow(self).to receive(:textual_authentications).and_return([])
  end

  include_examples "textual_group", "Relationships", %i(
    clusters
    hosts
    datastores
    vms
    templates
    orchestration_stacks
    ems_cloud
    network_manager
    custom_button_events
  )

  include_examples "textual_group", "Properties", %i(
    hostname
    ipaddress
    type
    port
    cpu_resources
    memory_resources
    cpus
    cpu_cores
    guid
    host_default_vnc_port_range
  )

  include_examples "textual_group", "Status", %i(refresh_status refresh_date orchestration_stacks_status)

  include_examples "textual_group_smart_management", %i(zone)
end
