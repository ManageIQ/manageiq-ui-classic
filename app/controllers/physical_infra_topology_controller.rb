class PhysicalInfraTopologyController < TopologyController
  include Mixins::BreadcrumbsMixin
  @layout = "physical_infra_topology"
  @service_class = PhysicalInfraTopologyService

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Physical Infrastructure")},
        {:title => _("Topology"), :url => controller_url},
      ],
    }
  end

  menu_section :phy
end
