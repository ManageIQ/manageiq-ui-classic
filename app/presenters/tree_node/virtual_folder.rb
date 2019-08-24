module TreeNode
  class VirtualFolder < Node
    set_attribute(:id, &:id)
    set_attribute(:text, &:title)
    set_attribute(:tooltip, &:title)
  end
end
