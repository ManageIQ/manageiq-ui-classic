module TreeNode
  class MiqWidget < Node
    set_attribute(:title, &:title)
    set_attribute(:tooltip, &:title)
  end
end
