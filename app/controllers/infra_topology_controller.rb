class InfraTopologyController < TopologyController
  include Mixins::NetworksBreadcrumbMixin
  @layout = "infra_topology"
  @service_class = InfraTopologyService

  def breadcrumbs_options
    @breadcrumbs_start = [{:title => _("Compute")}, {:title => _("Infrastructure")}, {:title => _("Topology"), :url => "/" + controller_name}]
  end

  menu_section :inf
end
