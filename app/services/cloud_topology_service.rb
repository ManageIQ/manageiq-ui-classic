class CloudTopologyService < TopologyService
  include UiServiceMixin

  @provider_class = ManageIQ::Providers::CloudManager

  @included_relations = [
    :tags,
    :availability_zones => [:tags, :vms => :tags],
    :cloud_tenants      => [:tags, :vms => :tags],
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
    if entity.kind_of?(ManageIQ::Providers::CloudManager)
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
    if entity.kind_of?(ManageIQ::Providers::CloudManager)
      entity.authentications.blank? ? 'Unknown' : entity.authentications.first.status.try(:capitalize)
    elsif entity.kind_of?(Vm)
      entity.power_state.capitalize
    elsif entity.kind_of?(AvailabilityZone)
      'OK'
    elsif entity.kind_of?(CloudTenant)
      entity.enabled? ? 'OK' : 'Unknown'
    else
      'Unknown'
    end
  end

  def build_kinds
    kinds = [:CloudManager, :AvailabilityZone, :CloudTenant, :Vm, :Tag]
    build_legend_kinds(kinds)
  end
end
