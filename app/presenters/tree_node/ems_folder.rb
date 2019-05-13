module TreeNode
  class EmsFolder < Node
    set_attribute(:icon) do
      %i[vandt_tree vat_tree].include?(@options[:tree]) ? 'pficon pficon-folder-close-blue' : @object.decorate.fonticon
    end

    set_attribute(:tooltip) { _("Folder: %{folder_name}") % {:folder_name => @object.name} }
  end
end
