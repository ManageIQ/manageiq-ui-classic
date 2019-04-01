class TreeBuilderAutomateCatalog < TreeBuilder
  private

  def override(node, object, _pid, _options)
    # Only the instance items should be clickable when selecting a catalog item entry point
    node[:selectable] = false unless object.kind_of?(MiqAeInstance)
  end

  def x_get_tree_roots(count_only, _options)
    count_only_or_objects(count_only, User.current_tenant.visible_domains)
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

    objects = filter_ae_objects(object.ae_namespaces)
    unless MiqAeClassController::MIQ_AE_COPY_ACTIONS.include?(@sb[:action])
      ns_classes = filter_ae_objects(object.ae_classes)
      objects += ns_classes if ns_classes.present?
    end
    count_only_or_objects(count_only, objects, %i(display_name name))
  end

  def filter_ae_objects(objects)
    return objects unless @sb[:cached_waypoint_ids]
    klass_name = objects.first.class.name
    prefix = klass_name == "MiqAeDomain" ? "MiqAeNamespace" : klass_name
    objects.select { |obj| @sb[:cached_waypoint_ids].include?("#{prefix}::#{obj.id}") }
  end
end
