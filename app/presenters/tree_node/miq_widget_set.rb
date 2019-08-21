module TreeNode
  class MiqWidgetSet < Node
    set_attributes(:text, :tooltip) do
      if @object.read_only? && @object.name == "default" # Default dashboard
        t = "#{@object.description} (#{@object.name})"
        [t, t]
      else
        [@object.name, @object.name]
      end
    end
  end
end
