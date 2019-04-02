module TreeNode
  class DialogGroup < Node
    set_attribute(:text, &:label)
  end
end
