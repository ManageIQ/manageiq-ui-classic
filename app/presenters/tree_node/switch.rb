module TreeNode
  class Switch < Node
    set_attribute(:icon) { @object.decorate.fonticon }
    set_attribute(:tooltip) { _("Switch: %{name}") % {:name => @object.name} }
  end
end
