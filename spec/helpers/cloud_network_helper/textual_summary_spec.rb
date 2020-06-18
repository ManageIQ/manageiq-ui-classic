describe CloudNetworkHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[
    parent_ems_cloud
    ems_network
    cloud_tenant
    instances
    cloud_subnets
    network_routers
    floating_ips
    custom_button_events
  ]
  include_examples "textual_group", "Properties", %i[name description type status ems_ref]
end
