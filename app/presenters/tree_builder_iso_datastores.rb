class TreeBuilderIsoDatastores < TreeBuilder
  has_kids_for IsoDatastore, %i[x_get_tree_iso_datastore_kids]

  private

  def tree_init_options
    {:lazy => true}
  end

  def root_options
    {
      :text    => t = _("All ISO Datastores"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    count_only_or_objects(false, IsoDatastore.all, "name")
  end

  def x_get_tree_iso_datastore_kids(object, count_only)
    count_only_or_objects(count_only, object.iso_images, "name")
  end
end
