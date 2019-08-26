class TreeBuilderServices < TreeBuilder
  include TreeBuilderFiltersMixin
  has_kids_for Service, [:x_get_tree_nested_services]

  private

  def tree_init_options
    {:lazy => true}
  end

  def services_root(id, text, tip)
    {
      :id   => id,
      :text => text,
      :icon => 'pficon pficon-folder-close',
      :tip  => tip
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    objects = [
      services_root('asrv', _('Active Services'), _('Active Services')),
      services_root('rsrv', _('Retired Services'), _('Retired Services')),
    ]
    count_only_or_objects(count_only, objects + FILTERS.values)
  end

  def x_get_tree_custom_kids(object, count_only)
    case object[:id]
    when 'my', 'global'
      count_only_or_filter_kids("Service", object, count_only)
    when 'asrv', 'rsrv'
      retired = object[:id] != 'asrv'
      # Cache the tree data to speed up child (count) retrieval
      @tree_data = fetch_services(Service, retired)
      services = @tree_data.keys

      return services.size if count_only

      # Preload the custom pictures for services
      MiqPreloader.preload(services.to_a, :picture)
      services
    end
  end

  def x_get_tree_nested_services(object, count_only)
    subtree = if @tree_data # If the cached tree data is available, find the child nodes in it
                deep_find(@tree_data, object).keys
              else # If it's a lazy load call, we have to retrieve the data manually
                fetch_services(object.descendants, object.retired).keys
              end

    return subtree.size if count_only

    # Preload the custom pictures for services
    MiqPreloader.preload(subtree, :picture)
    subtree
  end

  def fetch_services(query, retired)
    services = Rbac.filtered(query.where(:retired => retired, :display => true))
    Service.arrange_nodes(services.sort_by { |n| [n.ancestry.to_s, n.name.downcase] })
  end

  def deep_find(hash, key)
    return hash[key] if hash.try(:[], key)

    if hash.kind_of?(Hash)
      found = nil
      hash.find { |_, value| found = deep_find(value, key) }
      found
    end
  end
end
