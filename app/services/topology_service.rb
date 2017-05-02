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

  def entity_id(entity)
    entity_type(entity) + entity.compressed_id.to_s
  end

  def build_base_entity_data(entity)
    {
      :name   => entity.name,
      :kind   => entity_type(entity),
      :miq_id => entity.id
    }
  end

  def build_topology
    included_relations = self.class.instance_variable_get(:@included_relations)
    preloaded = @providers.includes(included_relations)
    nodes, edges = map_to_graph(preloaded, build_entity_relationships(included_relations))

    {
      :items     => nodes,
      :relations => edges,
      :kinds     => build_kinds,
      :icons     => icons
    }
  end

  def map_to_graph(providers, graph)
    topo_items = {}
    links = []

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
      links << build_link(parent, id) if parent
      # Skip if there are no more items in the generator graph
      next if relations.nil?

      relations.each_pair do |head, tail|
        # Apply the generator graph's first node on the entity
        method = head.to_s.underscore.downcase
        children = entity.send(method) if entity.respond_to?(method)
        next if children.nil?
        # Push the child/children to the stack with the chunked generator graph
        if children.respond_to?(:each)
          children.each { |child| stack.push([child, tail, id]) }
        else
          stack.push([children, tail, id])
        end
      end
    end

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
