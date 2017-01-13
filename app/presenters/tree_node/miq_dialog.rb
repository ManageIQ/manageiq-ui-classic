module TreeNode
  class MiqDialog < Node
    set_attribute(:title, &:description)
    set_attribute(:icon, 'fa fa-comment-o')
    set_attribute(:tooltip) { @object[0] }
  end
end
