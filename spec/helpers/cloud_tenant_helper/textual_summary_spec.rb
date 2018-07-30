describe CloudTenantHelper::TextualSummary do
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
  )
end
