class ContainerProjectTopologyService < ContainerTopologyService
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

  @kinds = %i(ContainerReplicator ContainerGroup Container ContainerNode ContainerService Host Vm ContainerRoute ContainerManager ContainerProject)
end
