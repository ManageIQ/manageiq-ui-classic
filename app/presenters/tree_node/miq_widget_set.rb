module TreeNode
  class MiqWidgetSet < Node
    set_attribute(:tooltip, &:name)
    set_attribute(:icon, 'fa fa-tachometer')
  end
end
