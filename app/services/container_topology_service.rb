class ContainerTopologyService < TopologyService
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

  @kinds = %i(ContainerReplicator ContainerGroup Container ContainerNode ContainerService Host Vm ContainerRoute ContainerManager)

  def entity_display_type(entity)
    if entity.kind_of?(ManageIQ::Providers::ContainerManager)
      entity.class.short_token
    elsif entity.kind_of?(ContainerGroup)
      "Pod"
    else
      name = entity.class.name.demodulize
      if name.start_with? "Container"
        if name.length > "Container".length # container related entities such as ContainerService
          name["Container".length..-1]
        else
          "Container" # the container entity itself
        end
      else
        if entity.kind_of?(Vm)
          name.upcase # turn Vm to VM because it's an abbreviation
        else
          name # non container entities such as Host
        end
      end
    end
  end

  def build_entity_data(entity)
    data = build_base_entity_data(entity)
    set_entity_status(data, entity)
    data[:display_kind] = entity_display_type(entity)

    if (entity.kind_of?(Host) || entity.kind_of?(Vm)) && entity.ext_management_system.present?
      data[:provider] = entity.ext_management_system.name
    end

    data
  end

  def entity_status(entity)
    case entity
    when ContainerReplicator
      if entity.current_replicas == entity.replicas
        'OK'
      else
        'Warning'
      end

    when ContainerGroup
      entity.phase

    when ContainerNode
      case entity.container_conditions.find_by(:name => 'Ready').try(:status)
      when 'True'
        'Ready'
      when 'False'
        'NotReady'
      end

    else
      super
    end
  end
end
