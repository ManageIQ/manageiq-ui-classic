module TreeNode
  class ConfigurationScriptBase < Node
    set_attribute(:icon, 'pficon pficon-template')
    set_attribute(:tooltip) { _("%{type}: %{name}") % {:name => @object.name, :type => ui_lookup(:model => @object.type)} }
  end
end
