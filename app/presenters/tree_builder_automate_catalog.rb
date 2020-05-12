class TreeBuilderAutomateCatalog < TreeBuilderAutomate
  private

  def tree_init_options
    super.merge!(:onclick => "miqOnClickAutomateCatalog")
  end

  def x_get_tree_roots
    count_only_or_objects(false, filter_ae_objects(User.current_tenant.visible_domains))
  end

  def override(node, object)
    # Only the instance items should be clickable when selecting a catalog item entry point
    node.selectable = false unless object.kind_of?(MiqAeInstance)
  end

  def x_get_tree_ns_kids(object, count_only)
    if object.respond_to?(:ae_namespaces) && filter_ae_objects(object.ae_namespaces).size == 1
      open_node("aen-#{object.id}")
      open_node("aen-#{object.ae_namespaces.first.id}")
    end

    if object.respond_to?(:ae_classes) && filter_ae_objects(object.ae_classes).size == 1
      open_node("aen-#{object.id}")
      open_node("aec-#{object.ae_classes.first.id}")
    end

    count_only_or_objects(count_only, filter_ae_objects(object.ae_namespaces + object.ae_classes), %i[display_name name])
  end

  def filter_ae_objects(objects)
    return objects unless @sb[:cached_waypoint_ids]
    klass_name = objects.first.class.name
    objects.select { |obj| @sb[:cached_waypoint_ids].include?("#{klass_name}::#{obj.id}") }
  end
end
