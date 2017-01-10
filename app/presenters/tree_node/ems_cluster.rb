module TreeNode
  class EmsCluster < Node
    set_attribute(:icon, 'pficon pficon-cluster')
    set_attribute(:tooltip) { "#{ui_lookup(:table => "ems_cluster")}: #{@object.name}" }
  end
end
