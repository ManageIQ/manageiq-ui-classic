class TreeBuilderEmsFolders < TreeBuilderAlertProfileAssign
  ANCESTRY_TYPE = EmsFolder

  def override(node, object)
    node.selectable = false
    if object.kind_of?(EmsFolder) && object.vm_folder?
      node.icon = "pficon pficon-folder-close-blue"
    else
      node.hide_checkbox = true
      node.checkable = false
    end
    node.checked = @selected_nodes&.include?("EmsFolder_#{object[:id]}")
  end
end
