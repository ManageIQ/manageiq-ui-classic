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
end
