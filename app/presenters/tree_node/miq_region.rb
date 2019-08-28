module TreeNode
  class MiqRegion < Node
    set_attribute(:tooltip) { @object[0] }
    set_attribute(:expanded, true)
  end
end
