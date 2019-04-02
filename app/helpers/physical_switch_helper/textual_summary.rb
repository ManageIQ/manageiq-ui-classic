module PhysicalSwitchHelper::TextualSummary
  include TextualMixins::TextualPowerState

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i(name product_name manufacturer serial_number part_number ports health_state uid_ems description)
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i(ext_management_system connected_physical_servers)
    )
  end

  def textual_group_management_networks
    TextualTable.new(_("Management Networks"), management_networks, [_("IP"), _("Default Gateway"), _("Subnet Mask")])
  end

  def textual_group_power_management
    TextualGroup.new(
      _("Power Management"),
      %i(power_state)
    )
  end

  def textual_group_firmware_details
    TextualTable.new(_("Firmwares"), firmware_details, [_("Name"), _("Version")])
  end

  def textual_ports
    ports_count = @record.physical_network_ports.count
    ports = {:label => _("Ports"), :value => ports_count, :icon => PhysicalNetworkPortDecorator.fonticon}
    if ports_count.positive?
      ports[:link] = url_for_only_path(:action => 'show', :id => @record, :display => 'physical_network_ports')
    end
    ports
  end

  def textual_ext_management_system
    textual_link(ExtManagementSystem.find(@record.ems_id))
  end

  def textual_connected_physical_servers
    physical_servers_count = @record.physical_servers.count
    physical_servers = {:label => _("Physical Servers"), :value => physical_servers_count, :icon => PhysicalServerDecorator.fonticon}
    if physical_servers_count.positive?
      physical_servers[:link] = url_for_only_path(:action => 'show', :id => @record, :display => 'physical_servers')
    end
    physical_servers
  end

  def textual_name
    {:label => _("Name"), :value => @record.name }
  end

  def textual_product_name
    {:label => _("Product Name"), :value => @record.asset_detail["product_name"] }
  end

  def textual_manufacturer
    {:label => _("Manufacturer"), :value => @record.asset_detail["manufacturer"] }
  end

  def textual_serial_number
    {:label => _("Serial Number"), :value => @record.asset_detail["serial_number"] }
  end

  def textual_part_number
    {:label => _("Part Number"), :value => @record.asset_detail["part_number"] }
  end

  def textual_health_state
    {:label => _("Health State"), :value => @record.health_state}
  end

  def textual_uid_ems
    {:label => _("UUID"), :value => @record.uid_ems }
  end

  def textual_description
    {:label => _("Description"), :value => @record.asset_detail["description"]}
  end

  def textual_power_state
    textual_power_state_whitelisted(@record.power_state)
  end

  def management_networks
    @record.hardware.networks.collect { |network| [network.ipaddress || network.ipv6address, network.default_gateway, network.subnet_mask] }
  end

  def firmware_details
    @record.hardware.firmwares.collect { |fw| [fw.name, fw.version] }
  end
end
