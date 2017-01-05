module TreeNode
  class ConfigurationScript < Node
    set_attribute(:icon, 'product product-template')
    set_attribute(:tooltip) { _("Ansible Tower Job Template: %{name}") % {:name => @object.name} }
  end
end
