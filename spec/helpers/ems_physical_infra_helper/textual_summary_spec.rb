describe EmsPhysicalInfraHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i(hostname type port guid)
  include_examples "textual_group", "Overview", %i(topology), "topology"
  include_examples "textual_group", "Relationships", %i(
    physical_racks
    physical_chassis
    physical_switches
    physical_storages
    physical_servers
    datastores
    vms
    physical_servers_with_host
  )
  include_examples "textual_group_smart_management", %i(zone)
end
