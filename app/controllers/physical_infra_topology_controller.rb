class PhysicalInfraTopologyController < TopologyController
  @layout = "physical_infra_topology"
  @service_class = PhysicalInfraTopologyService

  menu_section :inf
end
