module TreeNode
  class ChargebackRate < Node
    set_attribute(:text, &:description)
    set_attribute(:selectable, true)
  end
end
