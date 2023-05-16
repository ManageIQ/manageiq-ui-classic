class TreeBuilderAutomateCatalog < TreeBuilderAutomate
  private

  def tree_init_options
    super.merge!(:onclick => "miqOnClickAutomateCatalog")
  end

  def x_get_tree_roots
    count_only_or_objects(false, filter_ae_objects(User.current_tenant.enabled_domains))
  end

  def override(node, object)
    # Only the instance items should be clickable when selecting a catalog item entry point
    node.selectable = false unless object.kind_of?(MiqAeInstance)
  end

  def x_get_tree_ns_kids(object, count_only)
    namespaces = filter_ae_objects(object.try(:ae_namespaces))
    classes = filter_ae_objects(object.try(:ae_classes))

    if namespaces.size == 1
      open_node("aen-#{object.id}")
      open_node("aen-#{namespaces.first.id}")
    end

    if classes.size == 1
      open_node("aen-#{object.id}")
      open_node("aec-#{classes.first.id}")
    end

    count_only_or_objects(count_only, namespaces + classes, %i[display_name name])
  end

  def filter_ae_objects(objects)
    return [] if objects.blank?
    return objects unless @sb[:cached_waypoint_ids]

    klass_name = objects.first.class.name
    objects.select { |obj| @sb[:cached_waypoint_ids].include?("#{klass_name}::#{obj.id}") }
  end
end
