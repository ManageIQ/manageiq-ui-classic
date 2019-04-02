module TreeNode
  class ConfiguredSystem < Node
    set_attribute(:text, &:hostname)
    set_attribute(:tooltip) { _("Configured System: %{hostname}") % {:hostname => @object.hostname} }
  end
end
