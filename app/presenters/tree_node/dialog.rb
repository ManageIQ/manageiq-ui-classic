module TreeNode
  class Dialog < Node
    set_attribute(:title, &:label)
    set_attribute(:icon, 'fa fa-comment-o')
  end
end
