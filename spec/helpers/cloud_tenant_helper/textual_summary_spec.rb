describe CloudTenantHelper::TextualSummary do
  include TextualSummaryHelper

  before do
    instance_variable_set(:@record, FactoryBot.create(:cloud_tenant))
    allow(@record).to receive_message_chain(:cloud_resource_quotas, :order).and_return([])
    allow(self).to receive(:textual_authentications).and_return([])
  end

  include_examples "textual_group", "Properties", %i(name description)

  include_examples "textual_group", "Relationships", %i(
    ems_cloud
    instances images
    cloud_object_store_containers
    cloud_volumes
    cloud_volume_snapshots
    cloud_networks
    cloud_subnets
    network_routers
    security_groups
    floating_ips
    network_ports
    custom_button_events
  )

  include_examples "textual_group", "Quotas", []
end
