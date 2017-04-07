class NetworkTopologyController < TopologyController
  @layout = "network_topology"
  @service_class = NetworkTopologyService
  @ng_controller = 'networkTopologyController'

  menu_section :net

  add_entity(:kind  => "AvailabilityZone",
             :class => %w(Cloud AvailabilityZone),
             :icon  => '&#xE911;', # pficon-network
             :ypos  => 8,
             :label => _("Availability Zones"))

  add_entity(:kind  => "CloudSubnet",
             :class => %w(Network CloudSubnet),
             :icon  => '&#xE909;', # pficon-network
             :ypos  => 8,
             :label => _("Cloud Subnets"))

  add_entity(:kind  => "Vm",
             :class => %w(Infra),
             :icon  => '&#xE90f;', # pficon-virtual-machine
             :ypos  => 9,
             :label => _("VMs"))

  add_entity(:kind  => "SecurityGroup",
             :class => %w(Network SecurityGroup),
             :icon  => '&#xE903;', # pficon-cloud-security
             :ypos  => 9,
             :label => _("Security Groups"))

  add_entity(:kind  => "FloatingIp",
             :class => %w(Network FloatingIp),
             :icon  => '&#xF041;', # fa-map-marker
             :ypos  => 7,
             :label => _("Floating Ips"))

  add_entity(:kind  => "CloudNetwork",
             :class => %w(Network CloudNetwork),
             :icon  => '&#xE62C', # pficon-service
             :ypos  => 9,
             :label => _("Cloud Networks"))

  add_entity(:kind  => "NetworkRouter",
             :class => %w(Network NetworkRouter),
             :icon  => '&#xE625;', # pficon-route
             :ypos  => 7,
             :label => _("Network Routers"))

  add_entity(:kind  => "CloudTenant",
             :class => %w(Cloud CloudTenant),
             :icon  => '&#xE904;', # pficon-cloud-tenant
             :ypos  => 9,
             :label => _("Cloud Tenants"))

  add_entity(:kind  => "Tag",
             :class => %w(Network FloatingIp),
             :icon  => '&#xF02b;', # pficon-cloud-tenant
             :ypos  => 9,
             :label => _("Tags"))

  add_entity(:kind   => "LoadBalancer",
             :class  => %w(Network LoadBalancer),
             :icon   => '&#xE637;', # load_balancer
             :iclass => 'glyph',
             :ypos   => 8,
             :label  => _("Load Balancer"))
end
