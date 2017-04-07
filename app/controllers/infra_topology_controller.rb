class InfraTopologyController < TopologyController
  @layout = "infra_topology"
  @service_class = InfraTopologyService
  @ng_controller = 'infraTopologyController'

  menu_section :inf

  add_entity(:kind  => 'Host',
             :class => %w(Infra Host),
             :icon  => '&#xE600;', # pficon-host
             :ypos  => 8,
             :label => _('Nodes'))

  add_entity(:kind  => 'Vm',
             :class => %w(Infra),
             :icon  => '&#xE90f;', # pficon-virtual-machine
             :ypos  => 9,
             :label => _('VMs'))

  add_entity(:kind  => 'EmsCluster',
             :class => %w(Infra),
             :icon  => '&#xE620;', # pficon-cluster
             :ypos  => 9,
             :label => _('Roles'))

  add_entity(:kind  => 'Tag',
             :class => %w(Network FloatingIp),
             :icon  => '&#xF02b;', # pficon-cloud-tenant
             :ypos  => 9,
             :label => _('Tags'))
end
