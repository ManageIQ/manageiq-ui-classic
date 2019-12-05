class TreeBuilderResourcePools < TreeBuilderAlertProfileAssign
  ANCESTRY_TYPE = ResourcePool

  def override(node, object)
    node.selectable = false
    node.checkable = true if object.kind_of?(ResourcePool)
    node.hide_checkbox = true unless object.kind_of?(ResourcePool)
    node.checked = @selected_nodes&.include?("ResourcePool_#{object[:id]}")
  end
end
