ApplicationHelper::Toolbar::Custom = Struct.new(:name, :props) do
  def evaluate(view_context)
    # Collect properties for the React toolbar component from controller (view_context).
    props ? view_context.instance_eval(&props) : {}
  end
end
