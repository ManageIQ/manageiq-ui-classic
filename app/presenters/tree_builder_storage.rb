class TreeBuilderStorage < TreeBuilder
  include TreeBuilderFiltersMixin

  private

  def tree_init_options
    {:lazy => true, :allow_reselect => true}
  end

  def root_options
    {
      :text    => t = _("All Datastores"),
      :tooltip => t
    }
  end

  def x_get_tree_roots(count_only)
    count_only_or_objects(count_only, FILTERS.values)
  end

  def x_get_tree_custom_kids(object, count_only)
    objects = MiqSearch.where(:db => "Storage").filters_by_type(object[:id])
    count_only_or_objects(count_only, objects, 'description')
  end
end
