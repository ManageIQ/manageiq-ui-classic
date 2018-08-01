class PhysicalInfraTopologyService < TopologyService
  @provider_class = ManageIQ::Providers::PhysicalInfraManager

  # Keep it in a 'topological order' e.g: racks, chassis, servers
  @included_relations = [
    :writable_classification_tags,
    :physical_racks    => [
      :writable_classification_tags,
      :physical_chassis => [
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
      :physical_servers => [
        :writable_classification_tags,
        :physical_switches,
        :host => [
          :writable_classification_tags,
          :vms => :writable_classification_tags
        ]
      ]
    ],
    :physical_chassis  => [
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

  @kinds = %i(PhysicalInfraManager PhysicalRack PhysicalChassis PhysicalServer Host Vm Tag PhysicalSwitch)
  @filter_properties = %i(kind status)

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

  # We don't allow a node to have more than one parent.
  # The Physical Infra Topology must be a Tree without double links to the same node.
  def filter_links(links)
    has_parent = {}
    links.reverse.each_with_object([]) do |link, filtered_links|
      target = link[:target]
      unless has_parent[target]
        has_parent[target] = true
        filtered_links << link
      end
    end
  end
end
