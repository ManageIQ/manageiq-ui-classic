describe FloatingIpHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i[address type fixed_ip_address status]

  include_examples "textual_group", "Relationships", %i[
    parent_ems_cloud
    ems_network
    cloud_tenant
    instance
    network_port
    network_router
    cloud_network
  ]
end
