describe EmsNetworkHelper::TextualSummary do
  before do
    instance_variable_set(:@record, FactoryBot.create(:ems_infra))
    allow(self).to receive(:textual_authentications).and_return([])
  end

  include_examples "textual_group", "Properties", %i(provider_region hostname ipaddress type port guid)

  include_examples "textual_group", "Relationships", %i(
    parent_ems_cloud
    cloud_tenants
    cloud_networks
    cloud_subnets
    network_routers
    security_groups
    security_policies
    floating_ips
    network_ports
    network_services
    custom_button_events
  )

  include_examples "textual_group", "Status", %i(refresh_status refresh_date)

  include_examples "textual_group_smart_management", %i(zone)
end
