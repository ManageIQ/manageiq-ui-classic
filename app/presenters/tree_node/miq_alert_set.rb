module TreeNode
  class MiqAlertSet < Node
    set_attribute(:title, &:description)
    set_attribute(:icon) { @object.decorate.fonticon }
  end
end
