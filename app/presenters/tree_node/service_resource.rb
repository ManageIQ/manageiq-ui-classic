module TreeNode
  class ServiceResource < Node
    set_attribute(:icon) { @object.resource_type == 'VmOrTemplate' ? 'pficon pficon-virtual-machine' : 'product product-template' }

  end
end
