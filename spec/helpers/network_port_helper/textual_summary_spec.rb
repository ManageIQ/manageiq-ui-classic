describe NetworkPortHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i(name mac_address type device_owner floating_ip_addresses fixed_ip_addresses)

  include_examples "textual_group", "Relationships", %i(
    parent_ems_cloud
    ems_network
    cloud_tenant
    device
    cloud_subnets
    floating_ips
    security_groups
    host
  )
end
