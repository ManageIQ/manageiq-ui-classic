module GuestDeviceHelper::TextualSummary
  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i(device_name location manufacturer field_replaceable_unit)
    )
  end

  def textual_group_physical_network_ports
    physical_network_ports = {:labels => [_("Name"), _("MAC Address")]}
    physical_network_ports[:values] = @record.physical_network_ports.collect do |port|
      [
        port.port_name,
        port.mac_address
      ]
    end

    TextualMultilabel.new(
      _("Ports"),
      physical_network_ports
    )
  end

  def textual_group_firmware
    firmware = {:labels => [_("Name"), _("Version")]}
    firmware[:values] = @record.firmwares.collect do |fw|
      [
        fw.name,
        fw.version
      ]
    end

    TextualMultilabel.new(
      _("Firmware"),
      firmware
    )
  end

  def textual_device_name
    {:label => _("Name"), :value => @record.device_name}
  end

  def textual_manufacturer
    {:label => _("Manufacturer"), :value => @record.manufacturer}
  end

  def textual_location
    {:label => _("Location"), :value => @record.location}
  end

  def textual_field_replaceable_unit
    {:label => _("FRU"), :value => @record.field_replaceable_unit}
  end
end
