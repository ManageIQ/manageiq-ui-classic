class CloudTopologyService < TopologyService
  @provider_class = ManageIQ::Providers::CloudManager

  @included_relations = [
    :tags,
    :availability_zones => [:tags, :vms => :tags],
    :cloud_tenants      => [:tags, :vms => :tags],
  ]

  @kinds = %i(CloudManager AvailabilityZone CloudTenant Vm Tag)

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
    set_entity_status(data, entity)
    data[:display_kind] = entity_display_type(entity)

    if entity.try(:ems_id)
      data[:provider] = entity.ext_management_system.name
    end

    data
  end
end
