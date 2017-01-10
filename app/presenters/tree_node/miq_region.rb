module TreeNode
  class MiqRegion < Node
    set_attribute(:icon, 'pficon pficon-regions')
    set_attribute(:tooltip) { @object[0] }
    set_attribute(:expand, true)
  end
end
