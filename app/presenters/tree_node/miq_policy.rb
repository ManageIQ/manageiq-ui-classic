module TreeNode
  class MiqPolicy < Node
    set_attribute(:text) do
      @object.description
    end
  end
end
