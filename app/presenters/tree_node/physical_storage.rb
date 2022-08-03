module TreeNode
  class PhysicalStorage < Node
    set_attribute(:tooltip) { _("PhysicalStorage: %{name}") % {:name => @object.name} }
  end
end
