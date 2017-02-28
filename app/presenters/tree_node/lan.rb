module TreeNode
  class Lan < Node
    set_attribute(:icon) { @object.decorate.fonticon }
    set_attribute(:tooltip) { _("Port Group: %{name}") % {:name => @object.name} }
  end
end
