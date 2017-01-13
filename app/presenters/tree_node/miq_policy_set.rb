module TreeNode
  class MiqPolicySet < Node
    set_attribute(:title, &:description)
    set_attribute(:icon) { @object.active? ? 'fa fa-shield' : 'fa fa-inactive fa-shield' }
  end
end
