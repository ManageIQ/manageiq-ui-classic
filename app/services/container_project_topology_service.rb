class ContainerProjectTopologyService < TopologyService
  include UiServiceMixin
  include ContainerTopologyServiceMixin

  @provider_class = ContainerProject

  def build_topology
    topo_items = {}
    links = []

    included_relations = [
      :container_groups => [
        :containers,
        :container_replicator,
        :container_node     => [
          :lives_on => [:host]
        ],
        :container_services => [:container_routes]
      ]
    ]

    preloaded = @providers.includes(included_relations)

    preloaded.each do |entity|
      topo_items, links = build_recursive_topology(entity, build_entity_relationships(included_relations), topo_items, links)
    end

    populate_topology(topo_items, links, build_kinds, icons)
  end

  def build_kinds
    kinds = [:ContainerReplicator, :ContainerGroup, :Container, :ContainerNode,
             :ContainerService, :Host, :Vm, :ContainerRoute, :ContainerManager, :ContainerProject]
    build_legend_kinds(kinds)
  end
end
