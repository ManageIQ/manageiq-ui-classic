class ContainerTopologyService < TopologyService
  include UiServiceMixin
  include ContainerTopologyServiceMixin

  @provider_class = ManageIQ::Providers::ContainerManager

  def build_topology
    topo_items = {}
    links = []

    entity_relationships = {:ContainerManager => {:ContainerNodes =>
                                                      {:ContainerGroups =>
                                                         {:Containers => nil, :ContainerReplicator => nil, :ContainerServices => {:ContainerRoutes => nil}},
                                                       :lives_on => {:Host => nil}
                                                   }}}

    preloaded = @providers.includes(:container_nodes => [:container_groups => [:containers, :container_replicator, :container_services => [:container_routes]],
                                                         :lives_on => [:host]])
    preloaded.each do |entity|
      topo_items, links = build_recursive_topology(entity, entity_relationships[:ContainerManager], topo_items, links)
    end

    populate_topology(topo_items, links, build_kinds, icons)
  end

  def build_kinds
    kinds = [:ContainerReplicator, :ContainerGroup, :Container, :ContainerNode,
             :ContainerService, :Host, :Vm, :ContainerRoute, :ContainerManager]
    build_legend_kinds(kinds)
  end
end
