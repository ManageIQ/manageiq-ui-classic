module TreeNode
  class PxeImage < Node
    set_attribute(:icon) { @object.default_for_windows ? 'fa fa-cog' : 'product product-network_card' }
  end
end
