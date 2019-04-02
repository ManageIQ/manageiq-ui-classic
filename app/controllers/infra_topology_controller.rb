class InfraTopologyController < TopologyController
  include Mixins::BreadcrumbsMixin
  @layout = "infra_topology"
  @service_class = InfraTopologyService

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Infrastructure")},
        {:title => _("Topology"), :url => controller_url},
      ],
    }
  end

  menu_section :inf
end
