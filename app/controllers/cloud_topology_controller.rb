class CloudTopologyController < TopologyController
  @layout = "cloud_topology"
  @service_class = CloudTopologyService
  @ng_controller = 'cloudTopologyController'

  menu_section :clo

  add_entity(:kind  => 'Vm',
             :class => %w(Infra),
             :icon  => '&#xE90f;', # pficon-virtual-machine
             :ypos  => 9,
             :label => _('VMs'))

  add_entity(:kind  => 'AvailabilityZone',
             :class => %w(Network CloudSubnet),
             :icon  => '&#xE90f;', # pficon-network
             :ypos  => 8,
             :label => _('Availability Zones'))

  add_entity(:kind  => 'CloudTenant',
             :class => %w(Cloud CloudTenant),
             :icon  => '&#xE904;', # pficon-cloud-tenant
             :ypos  => 9,
             :label => _('Cloud Tenants'))

  add_entity(:kind  => 'Tag',
             :class => %w(Network FloatingIp),
             :icon  => '&#xF02b;', # pficon-cloud-tenant
             :ypos  => 9,
             :label => _('Tags'))
end
