ApplicationHelper::Toolbar::Custom = Struct.new(:name, :args) do
  def evaluate(view_context)
    # Collect properties for the React toolbar component from controller (view_context).
    args[:locals] ? view_context.instance_eval(&args[:locals]) : {}
  end

  attr_reader :content
end
