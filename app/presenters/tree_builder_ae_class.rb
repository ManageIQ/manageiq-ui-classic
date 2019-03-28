class TreeBuilderAeClass < TreeBuilder
  has_kids_for MiqAeClass, [:x_get_tree_class_kids]
  has_kids_for MiqAeNamespace, [:x_get_tree_ns_kids]

  private

  def tree_init_options
    {:lazy => true}
  end

  def root_options
    {
      :text    => t = _("Datastore"),
      :tooltip => t
    }
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only, _options)
    objects = if MiqAeClassController::MIQ_AE_COPY_ACTIONS.include?(@sb[:action])
                [MiqAeDomain.find_by(:id => @sb[:domain_id])] # GIT support can't use where
              else
                filter_ae_objects(User.current_tenant.visible_domains)
              end
    count_only_or_objects(count_only, objects)
  end

  def x_get_tree_class_kids(object, count_only)
    count_only_or_objects(count_only, object.ae_instances + object.ae_methods, %i(display_name name))
  end

  def x_get_tree_ns_kids(object, count_only)
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
