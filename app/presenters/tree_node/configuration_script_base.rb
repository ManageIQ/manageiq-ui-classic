module TreeNode
  class ConfigurationScriptBase < Node
    set_attribute(:icon, 'pficon pficon-template')
    set_attribute(:tooltip) { _("Ansible Tower Job Template: %{name}") % {:name => @object.name} }
  end
end
