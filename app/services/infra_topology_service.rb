class InfraTopologyService < TopologyService
  @provider_class = ManageIQ::Providers::InfraManager

  @included_relations = [
    :ems_clusters      => [
      :hosts => [
        :vms => nil
      ]
    ],
    :clusterless_hosts => [
      :vms => nil
    ],
  ]

  @kinds = %i[InfraManager EmsCluster Host Vm]

  def entity_type(entity)
    if entity.kind_of?(Host)
      entity.class.base_class.name.demodulize
    else
      super
    end
  end

  def entity_display_type(entity)
    if entity.kind_of?(ManageIQ::Providers::InfraManager)
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
    when ManageIQ::Providers::InfraManager
      entity.authentications.blank? ? 'Unknown' : entity.authentications.first.status.try(:capitalize)
    when Host
      entity.state ? entity.state.downcase.capitalize : 'Unknown'
    when Vm
      entity.power_state.capitalize
    else
      'Unknown'
    end
  end
end
