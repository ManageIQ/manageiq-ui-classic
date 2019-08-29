class TreeBuilderAlert < TreeBuilder
  private

  def tree_init_options
    {:full_ids => true}
  end

  # level 0 - root
  def root_options
    {
      :text    => t = _("All Alerts"),
      :tooltip => t
    }
  end

  # level 1 - alerts
  def x_get_tree_roots
    count_only_or_objects(false, MiqAlert.all, :description)
  end
end
