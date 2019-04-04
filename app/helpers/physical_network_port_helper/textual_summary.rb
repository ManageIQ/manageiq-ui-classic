module PhysicalNetworkPortHelper::TextualSummary
  def textual_group_properties
    TextualGroup.new(
      _('Properties'),
      %i[port_name port_type peer_mac_address mac_address]
    )
  end

  def textual_port_name
    {:label => _('Name'), :value => @record.port_name}
  end

  def textual_port_type
    {:label => _('Type'), :value => @record.port_type}
  end

  def textual_peer_mac_address
    {:label => _('Peer Mac Address'), :value => @record.peer_mac_address}
  end

  def textual_mac_address
    {:label => _('Mac Address'), :value => @record.mac_address}
  end
end
