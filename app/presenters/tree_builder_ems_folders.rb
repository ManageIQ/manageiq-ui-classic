class TreeBuilderEmsFolders < TreeBuilderAlertProfileAssign
  ANCESTRY_TYPE = EmsFolder

  def override(node, object, _pid, _options)
    node[:selectable] = false
    if object.kind_of?(EmsFolder) && blue?(object)
      node[:icon] = "pficon pficon-folder-close-blue"
    else
      node[:hideCheckbox] = true
    end
    node[:select] = @selected_nodes&.include?("EmsFolder_#{object[:id]}")
  end

  private

  def blue?(object)
    return false if object.parent.blank?

    object.parent.name == 'vm' &&
      object.parent.parent.present? &&
      object.parent.parent.kind_of?(Datacenter) ||
      blue?(object.parent)
  end
end
