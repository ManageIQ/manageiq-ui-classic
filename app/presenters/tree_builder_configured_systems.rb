class TreeBuilderConfiguredSystems < TreeBuilder
  include TreeBuilderFiltersMixin

  private

  def tree_init_options
    {:allow_reselect => true}
  end

  def x_get_tree_custom_kids(object, count_only)
    count_only_or_filter_kids(@root_class, object, count_only)
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    objects = []
    objects.push(configured_systems)
    count_only_or_objects(false, objects + FILTERS.values)
  end
end
