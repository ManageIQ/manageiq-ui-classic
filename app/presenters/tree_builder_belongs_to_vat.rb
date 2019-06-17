class TreeBuilderBelongsToVat < TreeBuilderBelongsToHac
  def blue?(object)
    return false if object.parent.blank?
    object.parent.name == 'vm' &&
      object.parent.parent.present? &&
      object.parent.parent.kind_of?(Datacenter) ||
      blue?(object.parent)
  end

  def override(node, object, _pid, options)
    node[:selectable] = false
    node[:checkable] = @edit.present? || @assign_to.present?
    if [ExtManagementSystem, EmsCluster, Datacenter].any? { |klass| object.kind_of?(klass) }
      node[:hideCheckbox] = true
    end
    if object.kind_of?(EmsFolder)
      if blue?(object)
        node[:icon] = "pficon pficon-folder-close-blue"
      else
        node[:hideCheckbox] = true
      end
      node[:select] = @selected_nodes&.include?("EmsFolder_#{object[:id]}")
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
