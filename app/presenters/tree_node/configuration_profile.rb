module TreeNode
  class ConfigurationProfile < Node
    set_attribute(:title) { @object.name.split('|').first }
    set_attribute(:icon) { @object.id ? 'fa fa-list-ul' : 'pficon pficon-folder-close' }
    set_attribute(:tooltip) { _("Configuration Profile: %{name}") % {:name => @object.name} }
  end
end
