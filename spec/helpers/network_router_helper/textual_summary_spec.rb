describe NetworkRouterHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i[name type status main_route_table route_propagation routes]

  include_examples "textual_group", "Relationships", %i[
    parent_ems_cloud
    ems_network
    cloud_tenant
    instances
    cloud_subnets
    external_gateway
    floating_ips
    security_groups
    custom_button_events
  ]
end
