describe CloudSubnetHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i[
    name
    type
    cidr
    gateway
    network_protocol
    dns_nameservers
    allocation_pools
    host_routes
    ip_version
  ]
  include_examples "textual_group", "Relationships", %i[
    parent_ems_cloud
    ems_network
    cloud_tenant
    availability_zone
    instances
    cloud_network
    network_router
    parent_subnet
    managed_subnets
    network_ports
    security_groups
    custom_button_events
  ]
end
