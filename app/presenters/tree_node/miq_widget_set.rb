module TreeNode
  class MiqWidgetSet < Node
    set_attribute(:tooltip, &:name)
    set_attribute(:icon) { @object.decorate_fonticon }
  end
end
