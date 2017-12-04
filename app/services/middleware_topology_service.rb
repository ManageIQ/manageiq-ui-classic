class MiddlewareTopologyService < TopologyService
  @provider_class = ManageIQ::Providers::MiddlewareManager

  @included_relations = [
    :middleware_domains => [
      :middleware_server_groups => [:middleware_servers => nil]
    ],
    :middleware_servers => [
      :middleware_deployments,
      :middleware_datasources,
      :middleware_messagings,
      :lives_on => [:host]
    ]
  ]

  @kinds = %i(
    MiddlewareDeployment
    MiddlewareDatasource
    MiddlewareDomain
    MiddlewareManager
    Vm
    Container
    MiddlewareServer
    MiddlewareServerEap
    MiddlewareServerWildfly
    MiddlewareServerGroup
    MiddlewareMessaging
  )

  def build_topology
    topology = super
    # filter out the redundant edges from ems to server, if there is also path ems -> domain -> sg -> server
    # this ensures the graph will remain a tree (instead of more general DAG)
    to_delete = topology[:relations].map do |link|
      next unless link[:target].match(/^MiddlewareServer[[:digit:]]/) && link[:source].match(/ServerGro/)
      link[:target]
    end.compact

    topology[:relations].reject! do |link|
      link[:source].match(/^MiddlewareManager/) && to_delete.include?(link[:target])
    end
    topology
  end

  def entity_display_type(entity)
    if entity.kind_of?(ManageIQ::Providers::MiddlewareManager)
      entity.class.short_token
    elsif entity.kind_of?(MiddlewareDeployment)
      suffix = if entity.name.end_with? '.ear'
                 'Ear'
               elsif entity.name.end_with? '.war'
                 'War'
               else
                 ''
               end
      entity.class.name.demodulize + suffix
    else
      entity.class.name.demodulize
    end
  end

  def build_entity_data(entity)
    data = build_base_entity_data(entity)
    data[:status] = 'Unknown'
    data[:display_kind] = entity_display_type(entity)

    unless glyph? entity
      data[:icon] = ActionController::Base.helpers.image_path(entity.decorate.try(:fileicon))
    end

    case entity
    when MiddlewareServer
      data[:status] = entity.properties['Calculated Server State'].underscore.humanize if entity.properties['Calculated Server State']
    when MiddlewareDeployment
      data[:status] = entity.status.capitalize if entity.status
    when Vm
      data[:status] = entity.power_state.capitalize
      data[:provider] = entity.ext_management_system.name
    end

    data
  end

  def glyph?(entity)
    [MiddlewareDatasource, MiddlewareDeployment, Vm, Container, MiddlewareDomain, MiddlewareServerGroup, MiddlewareMessaging]
      .any? { |klass| entity.kind_of? klass }
  end
end
