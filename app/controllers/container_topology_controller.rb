class ContainerTopologyController < TopologyController
  @layout = "container_topology"
  @service_class = ContainerTopologyService
  @ng_controller = 'containerTopologyController'

  menu_section :cnt

  add_entity(:kind  => "ContainerReplicator",
             :class => %w(Containers),
             :icon  => '&#xE624;', # pficon-replicator
             :ypos  => 8,
             :label => _("Replicators"))

  add_entity(:kind  => "ContainerGroup",
             :class => %w(Containers Pod),
             :icon  => '&#xF1B3;', # fa-cubes
             :ypos  => 6,
             :xpos  => 1,
             :label => _("Pods"))

  add_entity(:kind  => "Container",
             :class => %w(Containers Container),
             :icon  => '&#xF1B2;', # fa-cube
             :ypos  => 7,
             :label => _("Containers"))

  add_entity(:kind  => "ContainerService",
             :class => %w(Containers),
             :icon  => '&#xE61E;', # pficon-service
             :ypos  => 10,
             :xpos  => -2,
             :label => _("Services"))

  add_entity(:kind  => "ContainerRoute",
             :class => %w(Containers),
             :icon  => '&#xE625;', # pficon-route
             :ypos  => 8,
             :label => _("Routes"))

  add_entity(:kind  => "ContainerNode",
             :class => %w(Containers),
             :icon  => '&#xE621;', # pficon-container-node
             :ypos  => 9,
             :label => _("Nodes"))

  add_entity(:kind  => "Vm",
             :class => %w(Infra),
             :icon  => '&#xE90f;', # pficon-virtual-machine
             :ypos  => 9,
             :label => _("VMs"))

  add_entity(:kind  => "Host",
             :class => %w(Infra),
             :icon  => '&#xE600;', # pficon-screen
             :ypos  => 9,
             :label => _("Hosts"))
end
