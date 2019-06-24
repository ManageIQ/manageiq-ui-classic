class TreeBuilderServices < TreeBuilder
  has_kids_for Service, [:x_get_tree_nested_services]

  private

  def tree_init_options(_tree_name)
    {
      :leaf     => "Service",
      :add_root => false,
    }
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => true, :allow_reselect => true)
  end

  def root_options
    {}
  end

  def root_node(id, text, tip)
    {
      :id   => id,
      :text => text,
      :icon => 'pficon pficon-folder-close',
      :tip  => tip
    }
  end

  def services_root(id, name, tip)
    root_node(id, name, tip).update(:load_children => true)
  end

  def filter_root(id, name, tip)
    root_node(id, name, tip).update(:selectable => false)
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    objects = [
      services_root('asrv', _('Active Services'),  _('Active Services')),
      services_root('rsrv', _('Retired Services'), _('Retired Services')),
      filter_root('global', _('Global Filters'),   _('Global Shared Filters')),
      filter_root('my',     _('My Filters'),       _('My Personal Filters'))
    ]
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_custom_kids(object, count_only, options)
    case object[:id]
    when 'my', 'global'
      # Get My Filters and Global Filters
      count_only_or_objects(count_only, x_get_search_results(object, options[:leaf]))
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

  def x_get_search_results(object, leaf)
    case object[:id]
    when "global" # Global filters
      x_get_global_filter_search_results(leaf)
    when "my"     # My filters
      x_get_my_filter_search_results(leaf)
    end
  end

  def x_get_global_filter_search_results(leaf)
    MiqSearch.where(:db => leaf).visible_to_all.sort_by { |a| a.description.downcase }
  end

  def x_get_my_filter_search_results(leaf)
    MiqSearch.where(:db => leaf, :search_type => "user", :search_key => User.current_user.userid)
             .sort_by { |a| a.description.downcase }
  end
end
