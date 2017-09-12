class TreeBuilderAutomate < TreeBuilderAeClass
  def tree_init_options(_tree_name)
    {:leaf => "datastore", :full_ids => false}
  end

  def initialize(name, type, sandbox, build = true, controller = nil)
    @controller = controller
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
