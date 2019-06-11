class TreeBuilderAction < TreeBuilder
  private

  def tree_init_options
    {:full_ids => true}
  end

  # level 0 - root
  def root_options
    {
      :text    => t = _("All Actions"),
      :tooltip => t
    }
  end

  # level 1 - actions
  def x_get_tree_roots(count_only)
    count_only_or_objects(count_only, MiqAction.all, :description)
  end
end
