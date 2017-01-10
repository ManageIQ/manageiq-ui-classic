module TreeNode
  class MiqScsiLun < Node
    set_attribute(:title, &:canonical_name)
    set_attribute(:icon, 'fa fa-database')
    set_attribute(:tooltip) { _("LUN: %{name}") % {:name => @object.canonical_name} }
  end
end
