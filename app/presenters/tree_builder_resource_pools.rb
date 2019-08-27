class TreeBuilderResourcePools < TreeBuilderAlertProfileAssign
  ANCESTRY_TYPE = ResourcePool

  def override(node, object)
    node[:selectable] = false
    node[:class] = append_no_cursor(node[:class])
    node[:checkable] = true
    node[:hideCheckbox] = true unless object.kind_of?(ResourcePool)
    node[:state] ||= {}
    node[:state][:checked] = @selected_nodes&.include?("ResourcePool_#{object[:id]}")
  end
end
