class TreeBuilderPxeImageTypes < TreeBuilder
  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("All System Image Types"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    count_only_or_objects(false, PxeImageType.all, "name")
  end
end
