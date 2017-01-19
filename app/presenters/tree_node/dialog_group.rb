module TreeNode
  class DialogGroup < Node
    set_attribute(:title, &:label)
    set_attribute(:icon, 'fa fa-comments-o')
  end
end
