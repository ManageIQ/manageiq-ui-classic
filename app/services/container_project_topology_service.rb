class ContainerProjectTopologyService < TopologyService
  include UiServiceMixin
  include ContainerTopologyServiceMixin

  @provider_class = ContainerProject

  def build_topology
    topo_items = {}
    links = []

    entity_relationships = { :ContainerProject => { :ContainerGroups => {
                                                      :Containers          => nil,
                                                      :ContainerReplicator => nil,
                                                      :ContainerServices   => { :ContainerRoutes => nil },
                                                      :ContainerNode      => { :lives_on => {:Host => nil}}
                                                    }
                                                  }
                           }

    preloaded = @providers.includes(:container_groups => [:containers,
                                                          :container_replicator,
                                                          :container_node => [:lives_on => [:host]],
                                                          :container_services => [:container_routes]])

    preloaded.each do |entity|
      topo_items, links = build_recursive_topology(entity, entity_relationships[:ContainerProject], topo_items, links)
    end

    populate_topology(topo_items, links, build_kinds, icons)
  end


  def build_kinds
    kinds = [:ContainerReplicator, :ContainerGroup, :Container, :ContainerNode,
             :ContainerService, :Host, :Vm, :ContainerRoute, :ContainerManager, :ContainerProject]
    build_legend_kinds(kinds)
  end
end
