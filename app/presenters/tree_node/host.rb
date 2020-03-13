module TreeNode
  class Host < Node
    set_attribute(:tooltip) { _("Host: %{name}") % {:name => @object.name} }
  end
end
