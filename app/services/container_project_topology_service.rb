class ContainerProjectTopologyService < TopologyService
  include UiServiceMixin
  include ContainerTopologyServiceMixin

  @provider_class = ContainerProject

  @included_relations = [
    :container_groups => [
      :containers,
      :container_replicator,
      :container_node     => [
        :lives_on => [:host]
      ],
      :container_services => [:container_routes]
    ]
  ]

  def build_kinds
    kinds = [:ContainerReplicator, :ContainerGroup, :Container, :ContainerNode,
             :ContainerService, :Host, :Vm, :ContainerRoute, :ContainerManager, :ContainerProject]
    build_legend_kinds(kinds)
  end
end
