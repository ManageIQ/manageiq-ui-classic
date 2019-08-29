class TreeBuilderStoragePod < TreeBuilder
  has_kids_for EmsFolder, %i[x_get_ems_folder_kids]

  private

  def root_options
    {
      :text    => t = _("All Datastore Clusters"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    count_only_or_objects(false, EmsFolder.where(:type => 'StorageCluster'))
  end

  def x_get_ems_folder_kids(object, count_only)
    count_only_or_objects(count_only, object.try(:storages) || [], "name")
  end
end
