class TreeBuilderAutomate < TreeBuilderAeClass
  def tree_init_options
    {:full_ids => false, :lazy => true, :onclick => "miqOnClickAutomate"}
  end

  def initialize(name, type, sandbox, build = true, **params)
    @controller = params[:controller]
    super(name, type, sandbox, build)
  end

  def override(node, object, _pid, _options)
    if @type == 'catalog'
      # Only the instance items should be clickable when selecting a catalog item entry point
      node[:selectable] = false unless object.kind_of?(MiqAeInstance) # catalog
    elsif object.kind_of?(MiqAeNamespace) && object.domain?
      # Only the namespace items should be clickable when copying a class or instance
      node[:selectable] = false
    end
  end

  def x_get_tree_class_kids(object, count_only)
    count_only_or_objects(count_only, object.ae_instances, %i(display_name name))
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

    super(object, count_only)
  end

  def root_options
    {
      :text       => t = _("Datastore"),
      :tooltip    => t,
      :selectable => false
    }
  end
end
