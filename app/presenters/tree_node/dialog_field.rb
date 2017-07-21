module TreeNode
  class DialogField < Node
    set_attribute(:text, &:label)
  end
end
