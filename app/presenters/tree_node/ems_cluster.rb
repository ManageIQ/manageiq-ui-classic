module TreeNode
  class EmsCluster < Node
    set_attribute(:tooltip) { _("Cluster / Deployment Role: %{name}") % {:name => @object.name} }
  end
end
