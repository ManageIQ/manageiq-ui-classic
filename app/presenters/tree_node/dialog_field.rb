module TreeNode
  class DialogField < Node
    set_attribute(:title, &:label)
  end
end
