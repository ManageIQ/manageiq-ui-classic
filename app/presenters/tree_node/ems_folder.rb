module TreeNode
  class EmsFolder < Node
    set_attributes(:icon, :tooltip) do
      # TODO: move this logic into TreeBuilder#override for the specific trees
      icon = %i[vandt_tree vat_tree].include?(@options[:tree]) ? 'pficon pficon-folder-close-blue' : @object.decorate.fonticon
      tooltip = _("Folder: %{folder_name}") % {:folder_name => @object.name}
      [icon, tooltip]
    end
  end
end
