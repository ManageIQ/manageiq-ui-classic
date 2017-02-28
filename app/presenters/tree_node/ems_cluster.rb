module TreeNode
  class EmsCluster < Node
    set_attribute(:icon) { @object.decorate.fonticon }
    set_attribute(:tooltip) { _("Cluster / Deployment Role: %{name}") % {:name => @object.name} }
  end
end
