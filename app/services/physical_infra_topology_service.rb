class PhysicalInfraTopologyService < TopologyService
  @provider_class = ManageIQ::Providers::PhysicalInfraManager

  # Keep it in a 'topological order' e.g: racks, chassis, servers
  @included_relations = [
    :physical_racks    => %i[
      physical_chassis
      physical_servers
    ],
    :physical_chassis  => %i[
      child_physical_chassis
      physical_servers
    ],
    :physical_servers  => [
      :physical_switches,
      :host => [
        :vms => nil
      ]
    ],
    :physical_switches => [
    ],
  ]

  @kinds = %i[PhysicalInfraManager PhysicalRack PhysicalChassis PhysicalServer Host Vm PhysicalSwitch]
  @filter_properties = %i[kind status]

  # This priority mapping controls what connections will be present in the
  # final topology tree. Higher number means higher priority for linking.
  #
  # EXAMPLE Let us assume that we have the following tree or resources:
  #
  #   ems
  #   +-- R1
  #   |   +-- C1
  #   |   |   `-- S1
  #   |   `-- S2
  #   +-- C2
  #   |   `-- S3
  #   `-- S4
  #
  # After the graph is build, filter_link method will get as an input
  # unordered set of links, since graph-building algorithm does not guarantee
  # that links will be produced in any predetermined order. If we group edges
  # from the example tree according to the edge target, and then sort each
  # edge group according to the kind priority of the source, we get this:
  #
  #   (ems, R1),
  #   (ems, C1), (R1, C1),
  #   (ems, S1), (R1, S1), (C1, S1),
  #   (ems, S2), (R1, S2),
  #   (ems, C2),
  #   (ems, S3), (C2, S3),
  #   (ems, S4)
  #
  # Reproducing the initial tree from this set of links is now as simple as
  # taking the last edge from each group.
  KIND_PRIORITIES = {
    "Vm"                   => 70,
    "Host"                 => 60,
    "PhysicalSwitch"       => 50,
    "PhysicalServer"       => 40,
    "PhysicalChassis"      => 30,
    "PhysicalRack"         => 20,
    "PhysicalInfraManager" => 10
  }.freeze

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
    links.group_by { |link| link[:target] }.values.collect do |target_links|
      target_links.sort_by do |link|
        KIND_PRIORITIES.fetch(link[:source].tr("0-9", ""), 0)
      end.last
    end
  end
end
