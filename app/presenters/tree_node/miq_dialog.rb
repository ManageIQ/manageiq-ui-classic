module TreeNode
  class MiqDialog < Node
    set_attribute(:title, &:description)
    set_attribute(:tooltip) { @object[0] }
  end
end
