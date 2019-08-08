class TreeBuilderResourcePools < TreeBuilderAlertProfileAssign
  ANCESTRY_TYPE = ResourcePool

  def override(node, object)
    node[:selectable] = false
    node[:checkable] = true
    node[:hideCheckbox] = true unless object.kind_of?(ResourcePool)
    node[:select] = @selected_nodes&.include?("ResourcePool_#{object[:id]}")
  end
end
