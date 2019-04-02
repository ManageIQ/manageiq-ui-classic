module TreeNode
  class MiqScsiLun < Node
    set_attribute(:text, &:canonical_name)
    set_attribute(:tooltip) { _("LUN: %{name}") % {:name => @object.canonical_name} }
  end
end
