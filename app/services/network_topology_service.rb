class NetworkTopologyService < TopologyService
  @provider_class = ManageIQ::Providers::NetworkManager

  @included_relations = [
    :writable_classification_tags,
    :availability_zones => [
      :vms => [
        :writable_classification_tags,
        :floating_ips    => :writable_classification_tags,
        :cloud_tenant    => :writable_classification_tags,
        :security_groups => :writable_classification_tags,
      ]
    ],
    :cloud_subnets      => [
      :parent_cloud_subnet,
      :writable_classification_tags,
      :vms,
      :cloud_network  => :writable_classification_tags,
      :network_router => [
        :writable_classification_tags,
        :cloud_network => [
          :floating_ips => :writable_classification_tags
        ]
      ]
    ],
    :cloud_tenants      => [
      :network_routers => %i[
        floating_ips
        security_groups
        cloud_subnets
      ],
      :cloud_subnets   => [
        :security_groups
      ]
    ]
  ]

  @kinds = %i[NetworkRouter CloudSubnet Vm NetworkManager FloatingIp CloudNetwork NetworkPort CloudTenant SecurityGroup LoadBalancer Tag AvailabilityZone]

  def entity_type(entity)
    if entity.kind_of?(CloudNetwork) || entity.kind_of?(CloudSubnet)
      entity.class.base_class.name.demodulize
    else
      super
    end
  end

  def entity_display_type(entity)
    if entity.kind_of?(ManageIQ::Providers::NetworkManager)
      entity.class.short_token
    else
      name = entity.class.name.demodulize
      if entity.kind_of?(Vm)
        name.upcase # turn Vm to VM because it's an abbreviation
      elsif %w[Public Private].include?(name) && entity.kind_of?(CloudNetwork)
        entity_type(entity) + " " + name
      else
        name
      end
    end
  end

  def build_entity_data(entity)
    data = build_base_entity_data(entity)
    data[:status]       = entity_status(entity)
    data[:display_kind] = entity_display_type(entity)

    if (entity.kind_of?(Host) || entity.kind_of?(Vm)) && entity.try(:ems_id)
      data[:provider] = entity.ext_management_system.name
    end

    data
  end

  def entity_status(entity)
    case entity
    when Vm
      entity.power_state.nil? ? "Unknown" : entity.power_state.capitalize
    when ManageIQ::Providers::NetworkManager
      entity.authentications.blank? ? 'Unknown' : entity.authentications.first.status.try(:capitalize)
    when NetworkRouter, CloudSubnet, CloudNetwork, FloatingIp
      entity.status ? entity.status.downcase.capitalize : 'Unknown'
    when CloudTenant
      entity.enabled? ? "OK" : "Unknown"
    else
      'Unknown'
    end
  end
end
