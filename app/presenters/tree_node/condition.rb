module TreeNode
  class Condition < Node
    set_attribute(:text, &:description)
  end
end
