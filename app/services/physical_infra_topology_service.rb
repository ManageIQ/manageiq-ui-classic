class PhysicalInfraTopologyService < TopologyService
  @provider_class = ManageIQ::Providers::PhysicalInfraManager

  # Keep it in a 'topological order' e.g: racks, chassis, servers
  @included_relations = [
    :writable_classification_tags,
    :physical_racks    => [
      :writable_classification_tags,
      :physical_servers => [
        :writable_classification_tags,
        :physical_switches,
        :host => [
          :writable_classification_tags,
          :vms => :writable_classification_tags
        ]
      ]
    ],
    :physical_servers  => [
      :writable_classification_tags,
      :physical_switches,
      :host => [
        :writable_classification_tags,
        :vms => :writable_classification_tags
      ]
    ],
    :physical_switches => [
      :writable_classification_tags
    ],
  ]

  @kinds = %i(PhysicalInfraManager PhysicalRack PhysicalServer Host Vm Tag PhysicalSwitch)

  def entity_type(entity)
    if entity.kind_of?(Host)
      entity.class.base_class.name.demodulize
    else
      super
    end
  end

  def entity_display_type(entity)
    if entity.kind_of?(ManageIQ::Providers::PhysicalInfraManager)
      entity.class.short_token
    else
      name = entity.class.name.demodulize
      if entity.kind_of?(Vm)
        name.upcase # turn Vm to VM because it's an abbreviation
      else
        name
      end
    end
  end

  def build_entity_data(entity)
    data = build_base_entity_data(entity)
    data[:status]       = entity_status(entity)
    data[:display_kind] = entity_display_type(entity)

    if entity.try(:ems_id)
      data[:provider] = entity.ext_management_system.name
    end

    data
  end

  def entity_status(entity)
    case entity
    when ManageIQ::Providers::PhysicalInfraManager
      entity.authentications.blank? ? _('Unknown') : entity.authentications.first.status.try(:capitalize)
    when PhysicalServer, PhysicalSwitch, PhysicalStorage, PhysicalChassis
      entity.health_state ? entity.health_state : _('Unknown')
    when Host
      entity.state ? entity.state.downcase.capitalize : _('Unknown')
    when Vm
      entity.power_state ? entity.power_state.downcase.capitalize : _('Unknown')
    else
      _('Unknown')
    end
  end

  # Decide whether or not to add an entity to the graph stack
  def add_to_graph?(entity, links_index, links, parent_id)
    return true if entity.kind_of?(Tag) || entity.kind_of?(PhysicalSwitch)

    idx = links_index[entity_id(entity)]
    # If a node has already been processed, change its parent rather than pushing to the stack
    if idx
      links[idx][:source] = parent_id
      return false
    end
    true
  end
end
