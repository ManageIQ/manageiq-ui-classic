class ContainerTopologyService < TopologyService
  include UiServiceMixin
  include ContainerTopologyServiceMixin

  @provider_class = ManageIQ::Providers::ContainerManager

  def build_topology
    topo_items = {}
    links = []

    included_relations = [
      :container_nodes => [
        :container_groups => [
          :containers,
          :container_replicator,
          :container_services => [:container_routes]
        ],
        :lives_on         => [:host]
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
             :ContainerService, :Host, :Vm, :ContainerRoute, :ContainerManager]
    build_legend_kinds(kinds)
  end
end
