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
  def x_get_tree_roots(count_only)
    count_only_or_objects(count_only, IsoDatastore.all, "name")
  end

  def x_get_tree_iso_datastore_kids(object, count_only)
    iso_images = object.iso_images
    if count_only
      open_node("xx-isd_xx-#{object.id}")
      iso_images.size
    else
      objects = []
      unless iso_images.empty?
        open_node("isd_xx-#{object.id}")
        objects.push(
          :id   => "isd_xx-#{object.id}",
          :text => _("ISO Images"),
          :icon => "pficon pficon-folder-close",
          :tip  => _("ISO Images")
        )
      end
      objects
    end
  end

  def x_get_tree_custom_kids(object, count_only)
    nodes = (object[:full_id] || object[:id]).split('_')
    isd = IsoDatastore.find_by(:id => nodes.last.split('-').last)
    # Iso Datastore node was clicked OR folder nodes was clicked
    objects = isd.iso_images if nodes[0].end_with?("isd")
    count_only_or_objects(count_only, objects, "name")
  end
end
