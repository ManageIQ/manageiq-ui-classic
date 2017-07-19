module TreeNode
  class MiqWidget < Node
    set_attribute(:text, &:title)
    set_attribute(:tooltip, &:title)
  end
end
