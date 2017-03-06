module TreeNode
  class Condition < Node
    set_attribute(:title, &:description)
  end
end
