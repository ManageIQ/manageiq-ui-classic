class NetworkTopologyController < TopologyController
  include Mixins::BreadcrumbsMixin
  @layout = "network_topology"
  @service_class = NetworkTopologyService

  menu_section :net

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Networks")},
        {:title => _("Topology")},
      ],
    }
  end
end
