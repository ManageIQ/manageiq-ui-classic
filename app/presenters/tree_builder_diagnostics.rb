class TreeBuilderDiagnostics < TreeBuilder
  def initialize(name, type, sandbox, build = true, parent = nil)
    @root = parent
    super(name, type, sandbox, build)
  end

  private

  def tree_init_options
    {:add_root => false, :open_all => true}
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:click_url => "/ops/diagnostics_tree_select/",
                  :onclick   => "miqOnClickDiagnostics")
  end

  def x_build_single_node(object, pid, options)
    options[:parent_kls]  = @root.class.name
    options[:parent_name] = @root.name
    super(object, pid, options)
  end

  def root_options
    {}
  end
end
