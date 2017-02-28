module TreeNode
  class ConfigurationProfile < Node
    set_attribute(:title) { @object.name.split('|').first }
    set_attribute(:icon) { @object.decorate.fonticon }
    set_attribute(:tooltip) { _("Configuration Profile: %{name}") % {:name => @object.name} }
  end
end
