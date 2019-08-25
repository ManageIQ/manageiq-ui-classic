module TreeNode
  class ServiceTemplate < Node
    set_attribute(:text) do
      if @object.tenant.ancestors.empty?
        @object.name
      else
        "#{@object.name} (#{@object.tenant.name})"
      end
    end
  end
end
