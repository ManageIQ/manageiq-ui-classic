class ContainerTopologyController < TopologyController
  include Mixins::BreadcrumbsMixin
  @layout = "container_topology"
  @service_class = ContainerTopologyService

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Topology")},
      ],
    }
  end

  menu_section :cnt
end
