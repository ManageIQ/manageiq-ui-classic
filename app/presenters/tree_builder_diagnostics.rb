class TreeBuilderDiagnostics < TreeBuilder
  def initialize(name, sandbox, build = true, **params)
    @root = params[:root]
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {
      :open_all        => true,
      :click_url       => "/ops/diagnostics_tree_select/",
      :onclick         => "miqOnClickDiagnostics",
      :silent_activate => true
    }
  end

  def x_build_single_node(object, pid, options)
    options[:parent_kls]  = @root.class.name
    options[:parent_name] = @root.name
    super(object, pid, options)
  end
end
