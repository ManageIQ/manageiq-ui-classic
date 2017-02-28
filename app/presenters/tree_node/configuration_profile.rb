module TreeNode
  class ConfigurationProfile < Node
    set_attribute(:title) { @object.name.split('|').first }
    set_attribute(:tooltip) { _("Configuration Profile: %{name}") % {:name => @object.name} }
  end
end
