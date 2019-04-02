module TreeNode
  class GenericObjectDefinition < Node
    set_attribute(:image) { @object.decorate.fileicon }
  end
end
