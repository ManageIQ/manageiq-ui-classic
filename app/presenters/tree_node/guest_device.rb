module TreeNode
  class GuestDevice < Node
    set_attribute(:text, &:device_name)

    set_attribute(:tooltip) do
      if @object.device_type == "ethernet"
        _("Physical NIC: %{name}") % {:name => @object.device_name}
      else
        _("%{type} Storage Adapter: %{name}") % {:type => @object.controller_type, :name => @object.device_name}
      end
    end
  end
end
