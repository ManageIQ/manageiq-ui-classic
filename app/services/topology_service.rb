class TopologyService
  def initialize(provider_id = nil)
    provider_class = self.class.instance_variable_get(:@provider_class)
    # If the provider ID is not set, the topology needs to be generated for all the providers
    @providers = provider_id ? provider_class.where(:id => provider_id) : provider_class.all
  end

  def build_link(source, target)
    {:source => source, :target => target}
  end

  def entity_type(entity)
    entity.class.name.demodulize
  end

  def build_kinds
    kinds = self.class.instance_variable_get(:@kinds)
    kinds.each_with_object({}) { |kind, h| h[kind] = true }
  end

  def build_icons
    kinds = self.class.instance_variable_get(:@kinds)
    kind_icons = kinds.each_with_object({}) do |kind, h|
      klass = kind.to_s.safe_constantize

      next if klass.nil?

      h[kind] = {:type => 'glyph', :class => klass.decorate.fonticon}
    end

    @providers.to_a.uniq(&:class).each_with_object(kind_icons) do |provider, h|
      fileicon = provider.decorate.try(:fileicon)

      next if fileicon.nil?

      h[entity_display_type(provider)] = {:type => 'image', :icon => ActionController::Base.helpers.image_path(fileicon)}
    end
  end

  def entity_id(entity)
    entity_type(entity) + entity.id.to_s
  end

  def entity_name(entity)
    entity.name
  end

  # If needed, implemented this on its subclasses
  def add_to_graph?(_entity, _links_index, _links, _parent_id)
    true
  end

  # After the graph is completed, we can filter which links are valid
  # e.g.: We can perform a transitive reduction.
  def filter_links(links)
    links
  end

  def build_base_entity_data(entity)
    {
      :name   => entity_name(entity),
      :kind   => entity_type(entity),
      :model  => entity.class.to_s,
      :miq_id => entity.id,
      :key    => entity_id(entity)
    }
  end

  def group_nodes_by_model(nodes)
    return unless block_given?
    nodes_grouped_by_model = nodes.group_by { |_, v| v[:model] }

    nodes_grouped_by_model.each do |klass, entity_data|
      yield(klass, entity_data.map { |x| [x.second[:miq_id], x.second[:key]] }.to_h)
    end
  end

  def disallowed_nodes(nodes)
    remove_list = []
    group_nodes_by_model(nodes) do |klass, node_of_resource| # node is hash { 10001 => 'CloudNetwork1r0001'}
      node_resource_ids = node_of_resource.keys
      remove_ids = node_resource_ids - Rbac::Filterer.filtered(klass.safe_constantize.where(:id => node_resource_ids)).map(&:id)
      remove_list << remove_ids.map { |x| node_of_resource[x] } if remove_ids.present?
    end
    remove_list
  end

  def rbac_filter_nodes_and_edges(nodes, edges)
    disallowed_nodes(nodes).flatten.each do |x|
      nodes.delete(x)
      edges = edges.reject do |edge|
        edge[:source] == x || edge[:target] == x
      end
    end
    [nodes, edges]
  end

  def build_topology
    included_relations             = self.class.instance_variable_get(:@included_relations)
    preloaded                      = @providers.includes(included_relations)
    nodes, edges                   = map_to_graph(preloaded, build_entity_relationships(included_relations))
    filtered_nodes, filtered_edges = rbac_filter_nodes_and_edges(nodes, edges)
    filter_properties              = self.class.instance_variable_get(:@filter_properties)

    {
      :items             => filtered_nodes,
      :relations         => filtered_edges,
      :kinds             => build_kinds,
      :filter_properties => filter_properties,
      :icons             => build_icons
    }
  end

  def map_to_graph(providers, graph)
    topo_items = {}
    links = []
    links_index = {}
    stack = providers.map do |entity|
      [entity, graph, nil]
    end

    # Nonrecursively build and traverse the topology structure
    while stack.any?
      entity, relations, parent = stack.pop
      # Cache the entity ID as it will be used multiple times
      id = entity_id(entity)

      # Build a node from the current item
      topo_items[id] = build_entity_data(entity)
      # Create an edge if the node has a parent
      if parent
        links << build_link(parent, id)
        # Keep the index of a child in links
        links_index[id] = links.length - 1
      end
      # Skip if there are no more items in the generator graph
      next if relations.nil?

      relations.each_pair do |head, tail|
        # Apply the generator graph's first node on the entity
        method = head.to_s.underscore.downcase
        children = entity.send(method) if entity.respond_to?(method)
        next if children.nil?
        # Push the child/children to the stack with the chunked generator graph
        if children.respond_to?(:each)
          children.each do |child|
            stack.push([child, tail, id]) if add_to_graph?(child, links_index, links, id)
          end
        elsif add_to_graph?(children, links_index, links, id)
          stack.push([children, tail, id])
        end
      end
    end

    links = filter_links(links)

    [topo_items, links]
  end

  def build_entity_relationships(included_relations)
    hash = {}
    case included_relations
    when Hash
      included_relations.each_pair do |key, hash_value|
        hash_value = build_entity_relationships(hash_value)
        hash[key.to_s.camelize.to_sym] = hash_value
      end
    when Array
      included_relations.each do |array_value|
        hash.merge!(build_entity_relationships(array_value))
      end
    when Symbol
      hash[included_relations.to_s.camelize.to_sym] = nil
    end
    hash
  end
end
