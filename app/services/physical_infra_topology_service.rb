class PhysicalInfraTopologyService < TopologyService
  include UiServiceMixin

  @provider_class = ManageIQ::Providers::PhysicalInfraManager

  @included_relations = [
    :tags,
    :physical_servers => [:tags],
  ]

  def build_topology
    included_relations = self.class.instance_variable_get(:@included_relations)
    topo_items = {}
    links = []

    preloaded = @providers.includes(included_relations)

    preloaded.each do |entity|
      topo_items, links = build_recursive_topology(entity, build_entity_relationships(included_relations), topo_items, links)
    end

    populate_topology(topo_items, links, build_kinds, icons)
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
    else
      _('Unknown')
    end
  end

  def build_kinds
    kinds = [:PhysicalInfraManager, :PhysicalServer, :Tag]
    build_legend_kinds(kinds)
  end
end
