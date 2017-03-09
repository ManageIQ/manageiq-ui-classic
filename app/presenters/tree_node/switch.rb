module TreeNode
  class Switch < Node
    set_attribute(:tooltip) { _("Switch: %{name}") % {:name => @object.name} }
  end
end
