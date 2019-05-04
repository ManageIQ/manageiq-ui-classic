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
      services = Rbac.filtered(Service.where(:retired => retired, :display => true))
      return sevices.size if count_only
      subtree_root_services_with_preload(services)
    end
  end

  def x_get_tree_nested_services(object, count_only)
    services = Rbac.filtered(object.descendants.where(:retired => object.retired, :display => true))
    return services.size if count_only
    subtree_root_services_with_preload(services)
  end

  def subtree_root_services_with_preload(services)
    subtree = Service.arrange_nodes(services.sort_by { |n| [n.ancestry.to_s, n.name.downcase] }).keys
    MiqPreloader.preload(subtree, :picture)
    subtree
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
