module TreeNode
  class MiqAlertSet < Node
    set_attribute(:title, &:description)
    set_attribute(:icon, 'pficon pficon-warning-triangle-o')
  end
end
