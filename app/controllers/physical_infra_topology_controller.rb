class PhysicalInfraTopologyController < TopologyController
  @layout = "physical_infra_topology"
  @service_class = PhysicalInfraTopologyService
  @ng_controller = 'physicalInfraTopologyController'

  menu_section :inf

  add_entity(:kind  => 'PhysicalServer',
             :class => %w(PhysicalInfra),
             :icon  => '&#xe91a;', # pficon-server-group
             :ypos  => 8,
             :label => _("Physical Servers"))
end
