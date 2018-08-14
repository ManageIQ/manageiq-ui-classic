class CloudTopologyController < TopologyController
  include Mixins::NetworksBreadcrumbMixin
  
  @layout = "cloud_topology"
  @service_class = CloudTopologyService


  def breadcrumbs_options
    @breadcrumbs_start = [{:title => _("Compute")}, {:title => _("Clouds")}, {:title => _("Topology"),  :url => "/" + controller_name}]
  end

  menu_section :clo
end
