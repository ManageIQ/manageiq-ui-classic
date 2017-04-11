class ContainerTopologyService < TopologyService
  include UiServiceMixin
  include ContainerTopologyServiceMixin

  @provider_class = ManageIQ::Providers::ContainerManager

  @included_relations = [
    :container_nodes => [
      :container_groups => [
        :containers,
        :container_replicator,
        :container_services => [:container_routes]
      ],
      :lives_on         => [:host]
    ]
  ]

  def build_kinds
    kinds = [:ContainerReplicator, :ContainerGroup, :Container, :ContainerNode,
             :ContainerService, :Host, :Vm, :ContainerRoute, :ContainerManager]
    build_legend_kinds(kinds)
  end
end
