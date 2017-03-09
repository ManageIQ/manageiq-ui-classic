module TreeNode
  class EmsFolder < Node
    set_attributes(:icon, :tooltip) do
      if @object.kind_of?(Datacenter)
        icon = @object.decorate.fonticon # calls DatacenterDecorator#fonticon
        tooltip = _("Datacenter: %{datacenter_name}") % {:datacenter_name => @object.name}
      else
        # TODO: move this logic into TreeBuilder#override for the specific trees
        icon = %i(vandt vat).include?(@options[:type]) ? 'pficon pficon-folder-close-blue' : @object.decorate.fonticon
        tooltip = _("Folder: %{folder_name}") % {:folder_name => @object.name}
      end
      [icon, tooltip]
    end
  end
end
