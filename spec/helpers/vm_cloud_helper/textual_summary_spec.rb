describe VmCloudHelper::TextualSummary do
  before do
    instance_variable_set(:@record, FactoryBot.create(:vm))
  end

  include_examples "textual_group", "Properties", %i(
    name
    region
    server
    description
    ipaddress
    mac_address
    custom_1
    container
    preemptible
    tools_status
    load_balancer_health_check_state
    osinfo
    architecture
    snapshots
    advanced_settings
    resources
    guid
    virtualization_type
    root_device_type
    protected
    ems_ref
  )

  include_examples "textual_group", "Security", %i(users groups patches key_pairs)
end
