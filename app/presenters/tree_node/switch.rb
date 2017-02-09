module TreeNode
  class Switch < Node
    set_attribute(:icon, 'product product-switch')
    set_attribute(:tooltip) { _("Switch: %{name}") % {:name => @object.name} }
  end
end
