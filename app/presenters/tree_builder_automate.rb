class TreeBuilderAutomate < TreeBuilder
  has_kids_for MiqAeClass, [:x_get_tree_class_kids]
  has_kids_for MiqAeNamespace, [:x_get_tree_ns_kids]

  private

  def tree_init_options
    {:full_ids => false, :lazy => true, :onclick => "miqOnClickAutomate"}
  end

  def x_get_tree_roots(count_only)
    count_only_or_objects(count_only, [MiqAeDomain.find_by(:id => @sb[:domain_id])])
  end

  def override(node, object)
    if object.kind_of?(MiqAeNamespace) && object.domain?
      node[:selectable] = false
      node[:class] = append_no_cursor(node[:class])
    end
  end

  def x_get_tree_class_kids(object, count_only)
    count_only_or_objects(count_only, object.ae_instances, %i[display_name name])
  end

  def x_get_tree_ns_kids(object, count_only)
    if object.respond_to?(:ae_namespaces) && object.ae_namespaces.size == 1
      open_node("aen-#{object.id}")
      open_node("aen-#{object.ae_namespaces.first.id}")
    end

    if object.respond_to?(:ae_classes) && object.ae_classes.size == 1
      open_node("aen-#{object.id}")
      open_node("aec-#{object.ae_classes.first.id}")
    end

    count_only_or_objects(count_only, object.ae_namespaces, %i[display_name name])
  end

  def root_options
    {
      :text       => t = _("Datastore"),
      :tooltip    => t,
      :selectable => false
    }
  end
end
