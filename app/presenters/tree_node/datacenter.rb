module TreeNode
  class Datacenter < Node
    set_attribute(:tooltip) { _("Datacenter: %{datacenter_name}") % {:datacenter_name => @object.name} }
  end
end
