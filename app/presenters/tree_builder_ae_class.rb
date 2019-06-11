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
  def x_get_tree_roots(count_only)
    count_only_or_objects(count_only, User.current_tenant.visible_domains)
  end

  def x_get_tree_class_kids(object, count_only)
    count_only_or_objects(count_only, object.ae_instances + object.ae_methods, %i[display_name name])
  end

  def x_get_tree_ns_kids(object, count_only)
    count_only_or_objects(count_only, object.ae_namespaces + object.ae_classes, %i[display_name name])
  end
end
