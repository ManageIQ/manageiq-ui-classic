module TreeNode
  class Host < Node
    set_attribute(:tooltip) { _("Host / Node: %{name}") % {:name => @object.name} }
  end
end
