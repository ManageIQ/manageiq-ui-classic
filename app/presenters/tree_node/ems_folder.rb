module TreeNode
  class EmsFolder < Node
    set_attribute(:tooltip) { _("Folder: %{folder_name}") % {:folder_name => @object.name} }
  end
end
