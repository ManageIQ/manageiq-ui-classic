class TreeBuilderAutomate < TreeBuilderAeClass
  def tree_init_options
    {:full_ids => false}
  end

  def initialize(name, type, sandbox, build = true, **params)
    @selectable = params[:selectable]
    super(name, type, sandbox, build)
  end

  def override(node, object, _pid, _options)
    if @selectable
      # Only the instance items should be clickable when selecting a catalog item entry point
      node[:selectable] = false unless object.kind_of?(@selectable)
      # Only the namespace items should be clickable when copying a class or instance
      node[:selectable] = false if @selectable == MiqAeNamespace && !object.domain?
    end
  end

  def root_options
    {
      :text       => t = _("Datastore"),
      :tooltip    => t,
      :selectable => false
    }
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:onclick      => "miqOnClickAutomate",
                  :exp_tree     => false,
                  :autoload     => true,
                  :base_id      => "root",
                  :highlighting => true)
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
end
