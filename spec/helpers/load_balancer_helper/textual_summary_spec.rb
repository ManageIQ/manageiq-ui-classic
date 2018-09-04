describe LoadBalancerHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i(name type description listeners health_checks)

  include_examples "textual_group", "Relationships", %i(
    parent_ems_cloud
    ems_network
    cloud_tenant
    instances
    network_ports
    floating_ips
    security_groups
    custom_button_events
  )
end
