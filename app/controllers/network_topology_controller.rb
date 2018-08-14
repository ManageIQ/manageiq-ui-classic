class NetworkTopologyController < TopologyController
  include Mixins::NetworksBreadcrumbMixin
  @layout = "network_topology"
  @service_class = NetworkTopologyService

  menu_section :net

  def breadcrumbs_options
    @breadcrumbs_start = [{:title => _("Networks")}, {:title => _("Topology")}]
  end
end
