module TreeNode
  class ConfigurationScriptBase < Node
    set_attribute(:icon, 'ff ff-template')
    set_attribute(:tooltip) { _("Ansible Tower Job Template: %{name}") % {:name => @object.name} }
  end
end
