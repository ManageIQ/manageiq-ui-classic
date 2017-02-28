module TreeNode
  class GuestDevice < Node
    set_attribute(:title, &:device_name)

    set_attribute(:icon) { @object.decorate.fonticon }

    set_attribute(:tooltip) do
      if @object.device_type == "ethernet"
        _("Physical NIC: %{name}") % {:name => @object.device_name}
      else
        _("%{type} Storage Adapter: %{name}") % {:type => @object.controller_type, :name => @object.device_name}
      end
    end
  end
end
