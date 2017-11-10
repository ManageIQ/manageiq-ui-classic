module TreeNode
  class MiqAeMethod < MiqAeNode
    set_attribute(:image) { @object.try(:decorate).try(:fileicon) }
  end
end
