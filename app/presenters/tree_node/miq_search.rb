module TreeNode
  class MiqSearch < Node
    set_attribute(:text, &:description)
    set_attribute(:tooltip) { _("Filter: %{filter_description}") % {:filter_description => @object.description} }
  end
end
