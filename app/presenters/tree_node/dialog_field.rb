module TreeNode
  class DialogField < Node
    set_attribute(:title, &:label)
    set_attribute(:icon, 'product product-field')
  end
end
