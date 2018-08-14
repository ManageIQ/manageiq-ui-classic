class CloudTopologyController < TopologyController
  include Mixins::BreadcrumbsMixin

  @layout = "cloud_topology"
  @service_class = CloudTopologyService

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Clouds")},
        {:title => _("Topology"), :url => controller_url},
      ],
    }
  end

  menu_section :clo
end
