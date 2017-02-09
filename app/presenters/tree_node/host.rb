module TreeNode
  class Host < Node
    set_attribute(:icon, 'pficon pficon-screen')
    set_attribute(:tooltip) { _("Host / Node: %{name}") % {:name => @object.name} }
  end
end
