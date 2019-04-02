module TreeNode
  class MiqEventDefinition < Node
    set_attribute(:text, &:description)
  end
end
