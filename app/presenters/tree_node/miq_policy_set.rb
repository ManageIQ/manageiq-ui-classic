module TreeNode
  class MiqPolicySet < Node
    set_attribute(:title, &:description)
    set_attribute(:icon) { @object.decorate.fonticon }
  end
end
