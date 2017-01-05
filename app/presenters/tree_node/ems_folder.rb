module TreeNode
  class EmsFolder < Node
    set_attributes(:icon, :tooltip) do
      if @object.kind_of?(Datacenter)
        icon = 'fa fa-building-o'
        tooltip = _("Datacenter: %{datacenter_name}") % {:datacenter_name => @object.name}
      else
        icon = "pficon #{%i(vandt vat).include?(@options[:type]) ? 'pficon-folder-close-blue' : 'pficon-folder-close'}"
        tooltip = _("Folder: %{folder_name}") % {:folder_name => @object.name}
      end
      [icon, tooltip]
    end
  end
end
