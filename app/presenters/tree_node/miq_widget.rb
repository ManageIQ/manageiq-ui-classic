module TreeNode
  class MiqWidget < Node
    set_attribute(:title, &:title)
    set_attribute(:tooltip, &:title)
    set_attribute(:icon) { @object.decorate.fonticon }
  end
end
