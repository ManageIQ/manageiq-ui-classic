module TreeNode
  class Root < TreeNode::Hash
    set_attribute(:key) { @object[:key] || 'root' }
    set_attribute(:icon) { @object[:icon] || 'pficon pficon-folder-close' }
    set_attribute(:expanded) { true }
    set_attribute(:tooltip) { @object[:tooltip] }
  end
end
