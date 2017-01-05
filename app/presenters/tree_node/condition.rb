module TreeNode
  class Condition < Node
    set_attribute(:title, &:description)
    set_attribute(:icon, 'product product-miq_condition')
  end
end
