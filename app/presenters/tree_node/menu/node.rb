module TreeNode
  module Menu
    class Node < TreeNode::Node
      set_attribute(:selectable, false)
      set_attribute(:icon, "pficon pficon-folder-close")
      set_attribute(:checkable) { @options[:editable] }
    end
  end
end
