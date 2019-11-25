class CloudTopologyService < TopologyService
  @provider_class = ManageIQ::Providers::CloudManager

  @included_relations = [
    :availability_zones => [:vms => nil],
    :cloud_tenants      => [:vms => nil],
  ]

  @kinds = %i[CloudManager AvailabilityZone CloudTenant Vm]

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
      entity.authentications.blank? ? 'Unknown' : entity.authentication_for_providers.first.status.try(:capitalize)
    elsif entity.kind_of?(Vm)
      entity.power_state.nil? ? 'Unknown' : entity.power_state.capitalize
    elsif entity.kind_of?(AvailabilityZone)
      'OK'
    elsif entity.kind_of?(CloudTenant)
      entity.enabled? ? 'OK' : 'Unknown'
    else
      'Unknown'
    end
  end
end
