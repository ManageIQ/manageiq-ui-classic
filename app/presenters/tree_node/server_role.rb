module TreeNode
  class ServerRole < Node
    set_attribute(:expanded, true)

    set_attributes(:text, :tooltip) do
      status = "stopped"
      @object.assigned_server_roles.where(:active => true).each do |asr| # Go thru all active assigned server roles
        next unless asr.miq_server.started? # Find a started server

        if @tree.root.kind_of?(::MiqRegion) || # it's in the region
           (@tree.root.kind_of?(::Zone) && asr.miq_server.my_zone == @tree.root.try(:name)) # it's in the zone
          status = "active"
          break
        end
      end
      text = _("Role: %{description} (%{status})") % {:description => @object.description, :status => status}
      [text, text]
    end
  end
end
