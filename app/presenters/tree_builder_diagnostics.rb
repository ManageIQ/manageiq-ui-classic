class TreeBuilderDiagnostics < TreeBuilder
  attr_reader :root

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
end
