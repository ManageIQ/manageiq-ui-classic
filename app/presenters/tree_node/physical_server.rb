module TreeNode
  class PhysicalServer < Node
    set_attribute(:text, &:name)
  end
end
