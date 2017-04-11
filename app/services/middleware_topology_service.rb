class MiddlewareTopologyService < TopologyService
  include UiServiceMixin

  @provider_class = ManageIQ::Providers::MiddlewareManager

  def build_topology
    topo_items = {}
    links = []

    included_relations = [
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

    preloaded = @providers.includes(included_relations)

    preloaded.each do |entity|
      topo_items, links = build_recursive_topology(entity, build_entity_relationships(included_relations), topo_items, links)
    end

    # filter out the redundant edges from ems to server, if there is also path ems -> domain -> sg -> server
    # this ensures the graph will remain a tree (instead of more general DAG)
    to_delete = links.select { |e| e[:target].match(/^MiddlewareServer[[:digit:]]/) && e[:source].match(/ServerGro/) }
                     .map { |e| e[:target] }

    filtered_links = links.select { |e| !e[:source].match(/^MiddlewareManager/) || !to_delete.include?(e[:target]) }

    populate_topology(topo_items, filtered_links, build_kinds, icons)
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

    if entity.kind_of?(Vm)
      data[:status] = entity.power_state.capitalize
      data[:provider] = entity.ext_management_system.name
    end

    data
  end

  def glyph?(entity)
    [MiddlewareDatasource, MiddlewareDeployment, Vm, MiddlewareDomain, MiddlewareServerGroup, MiddlewareMessaging]
      .any? { |klass| entity.kind_of? klass }
  end

  def build_kinds
    kinds = [:MiddlewareDeployment, :MiddlewareDatasource, :MiddlewareDomain, :MiddlewareManager, :Vm,
             :MiddlewareServer, :MiddlewareServerGroup, :MiddlewareMessaging]
    build_legend_kinds(kinds)
  end
end
