class TreeBuilderServices < TreeBuilder
  # Services are returned in a tree - kids are discovered automatically

  private

  def tree_init_options
    {:lazy => true, :allow_reselect => true}
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
  def x_get_tree_roots(count_only)
    objects = [
      services_root('asrv', _('Active Services'),  _('Active Services')),
      services_root('rsrv', _('Retired Services'), _('Retired Services')),
      filter_root('global', _('Global Filters'),   _('Global Shared Filters')),
      filter_root('my',     _('My Filters'),       _('My Personal Filters'))
    ]
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_custom_kids(object, count_only, _options)
    # Get My Filters and Global Filters
    count_only_or_objects(count_only, x_get_search_results(object)) if %w[my global].include?(object[:id])
  end

  def x_get_search_results(object)
    case object[:id]
    when "global" # Global filters
      x_get_global_filter_search_results
    when "my"     # My filters
      x_get_my_filter_search_results
    end
  end

  def x_get_global_filter_search_results
    MiqSearch.where(:db => "Service").visible_to_all.sort_by { |a| a.description.downcase }
  end

  def x_get_my_filter_search_results
    MiqSearch.where(:db => "Service", :search_type => "user", :search_key => User.current_user.userid)
             .sort_by { |a| a.description.downcase }
  end
end
