module TreeNode
  module Menu
    class Node < TreeNode::Node
      set_attribute(:no_click, true)
      set_attribute(:icon, "pficon pficon-folder-close")
      set_attribute(:checkable) { @options[:editable] }
    end
  end
end
