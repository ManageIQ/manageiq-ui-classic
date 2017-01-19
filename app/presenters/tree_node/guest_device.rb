module TreeNode
  class GuestDevice < Node
    set_attribute(:title, &:device_name)

    set_attributes(:icon, :tooltip) do
      if @object.device_type == "ethernet"
        icon = 'product product-network_card'
        tooltip = _("Physical NIC: %{name}") % {:name => @object.device_name}
      else
        icon = "product product-network_card"
        tooltip = _("%{type} Storage Adapter: %{name}") % {:type => @object.controller_type, :name => @object.device_name}
      end

      [icon, tooltip]
    end
  end
end
