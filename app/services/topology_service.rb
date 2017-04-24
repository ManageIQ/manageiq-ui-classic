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

  def populate_topology(topo_items, links, kinds, icons)
    {
      :items     => topo_items,
      :relations => links,
      :kinds     => kinds,
      :icons     => icons
    }
  end

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

  def build_recursive_topology(entity, entity_relationships_mapping, topo_items, links)
    unless entity.nil?
      topo_items[entity_id(entity)] = build_entity_data(entity)
      unless entity_relationships_mapping.nil?
        entity_relationships_mapping.keys.each do |rel_name|
          relations = entity.send(rel_name.to_s.underscore.downcase)
          if relations.kind_of?(ActiveRecord::Associations::CollectionProxy)
            relations.each do |relation|
              build_rel_data_and_links(entity, entity_relationships_mapping, rel_name, links, relation, topo_items)
            end
          else
            # single relation such as has_one or belongs_to, can't iterate with '.each'
            build_rel_data_and_links(entity, entity_relationships_mapping, rel_name, links, relations, topo_items)
          end
        end
      end
    end

    [topo_items, links]
  end

  def build_rel_data_and_links(entity, entity_relationships, key, links, relation, topo_items)
    unless relation.nil?
      topo_items[entity_id(relation)] = build_entity_data(relation)
      links << build_link(entity_id(entity), entity_id(relation))
    end
    build_recursive_topology(relation, entity_relationships[key], topo_items, links)
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
