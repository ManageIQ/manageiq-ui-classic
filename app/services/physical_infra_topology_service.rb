class PhysicalInfraTopologyService < TopologyService
  @provider_class = ManageIQ::Providers::PhysicalInfraManager

  @included_relations = [
    :tags,
    :physical_servers => [:tags],
  ]

  @kinds = %i(PhysicalInfraManager PhysicalServer Tag)

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
end
