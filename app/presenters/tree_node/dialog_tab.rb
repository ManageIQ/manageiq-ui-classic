module TreeNode
  class DialogTab < Node
    set_attribute(:title, &:label)
    set_attribute(:icon, 'product product-tab')
  end
end
