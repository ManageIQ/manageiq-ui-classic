module TreeNode
  class Storage < Node
    set_attribute(:text, &:name) # Even this is obvious, it's needed for additional changes in the C&U tree
  end
end
