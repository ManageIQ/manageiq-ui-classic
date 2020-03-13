module TreeNode
  class EmsCluster < Node
    set_attribute(:tooltip) { _("Cluster: %{name}") % {:name => @object.name} }
  end
end
