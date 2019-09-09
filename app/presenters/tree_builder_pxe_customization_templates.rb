class TreeBuilderPxeCustomizationTemplates < TreeBuilder
  has_kids_for PxeImageType, %i[x_get_tree_pxe_image_type_kids]
  private

  def tree_init_options
    {:lazy => true}
  end

  def root_options
    text = _("All Customization Templates - System Image Types")
    {
      :text    => text,
      :tooltip => text
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    objects = []
    objects.push(:id   => "xx-system",
                 :text => _("Examples (read only)"),
                 :icon => "pficon pficon-folder-close",
                 :tip  => _("Examples (read only)"))
    PxeImageType.all.sort.each do |item, _idx|
      objects.push(item)
    end
    objects
  end

  def get_pxe_image_id(nodes)
    nodes.length >= 3 ? nodes[2] : nodes[1]
  end

  def x_get_tree_pxe_image_type_kids(object, count_only)
    objects = CustomizationTemplate.where(:pxe_image_type_id => object.id)
    count_only_or_objects(count_only, objects, "name")
  end

  # Handle custom tree nodes (object is the Examples folder)
  def x_get_tree_custom_kids(object, count_only)
    objects = CustomizationTemplate.where(:pxe_image_type_id => nil)
    count_only_or_objects(count_only, objects, "name")
  end
end
