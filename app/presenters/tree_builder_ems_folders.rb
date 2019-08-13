class TreeBuilderEmsFolders < TreeBuilderAlertProfileAssign
  ANCESTRY_TYPE = EmsFolder

  def override(node, object)
    node[:selectable] = false
    if object.kind_of?(EmsFolder) && object.vm_folder?
      node[:icon] = "pficon pficon-folder-close-blue"
    else
      node[:hideCheckbox] = true
    end
    node[:select] = @selected_nodes&.include?("EmsFolder_#{object[:id]}")
  end
end
