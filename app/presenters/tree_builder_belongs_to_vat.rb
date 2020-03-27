class TreeBuilderBelongsToVat < TreeBuilderBelongsToHac
  def override(node, object)
    node.selectable = false
    node.checkable = @edit.present? || @assign_to.present?

    if object.kind_of?(EmsFolder) && object.vm_folder?
      node.icon = "pficon pficon-folder-close-blue"
    else
      node.hide_checkbox = true
    end

    node.checked = @selected_nodes&.one? do |s|
      prefix, id = s.split('_') # The prefix can be any subclass of EmsFolder
      prefix.safe_constantize < EmsFolder && id.to_i == object[:id].to_i
    end
  end

  def x_get_tree_datacenter_kids(parent, count_only)
    children = parent.folders.each_with_object([]) do |child, arr|
      next if !child.kind_of?(EmsFolder) || child.name == 'host'

      child.name == 'vm' ? arr.concat(child.folders_only) : arr.push(child)
    end

    count_only_or_objects(count_only, children)
  end
end
