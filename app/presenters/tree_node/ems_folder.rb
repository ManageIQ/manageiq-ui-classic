module TreeNode
  class EmsFolder < Node
    set_attribute(:icon) do
      case @tree
      when TreeBuilderVandt
        'pficon pficon-folder-close-blue'
      else
        @object.decorate.fonticon
      end
    end

    set_attribute(:tooltip) { _("Folder: %{folder_name}") % {:folder_name => @object.name} }
  end
end
