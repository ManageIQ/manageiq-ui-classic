module TreeNode
  class MiqSearch < Node
    set_attribute(:title, &:description)
    set_attribute(:icon, 'fa fa-filter')
    set_attribute(:tooltip) { _("Filter: %{filter_description}") % {:filter_description => @object.description} }
  end
end
