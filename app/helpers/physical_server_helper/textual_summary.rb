module PhysicalServerHelper::TextualSummary
  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i(name model product_name manufacturer machine_type serial_number ems_ref memory cores health_state loc_led_state)
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i(host ext_management_system)
    )
  end

  def textual_group_compliance
  end

  def textual_group_networks
    TextualGroup.new(_("Networks"), %i(mac ipv4 ipv6))
  end

  def textual_group_assets
    TextualGroup.new(
      _("Assets"),
      %i(support_contact description location room_id rack_name lowest_rack_unit)
    )
  end

  def textual_group_power_management
    TextualGroup.new(
      _("Power Management"),
      %i(power_state)
    )
  end

  def textual_group_firmware_details
    TextualCustom.new(
      _("Firmware"),
      "textual_firmware_table",
      %i(fw_details)
    )
  end

  def textual_host
    {:label => _("Host"), :value => @record.host.try(:name), :icon => "pficon pficon-virtual-machine", :link => url_for(:controller => 'host', :action => 'show', :id => @record.host.try(:id))}
  end

  def textual_ext_management_system
    textual_link(ExtManagementSystem.find(@record.ems_id))
  end

  def textual_name
    {:label => _("Server name"), :value => @record.name }
  end

  def textual_product_name
    {:label => _("Product Name"), :value => @record.product_name }
  end

  def textual_manufacturer
    {:label => _("Manufacturer"), :value => @record.manufacturer }
  end

  def textual_machine_type
    {:label => _("Machine Type"), :value => @record.machine_type }
  end

  def textual_serial_number
    {:label => _("Serial Number"), :value => @record.serial_number }
  end

  def textual_ems_ref
    {:label => _("UUID"), :value => @record.ems_ref }
  end

  def textual_model
    {:label => _("Model"), :value => @record.model}
  end

  def textual_memory
    {:label => _("Total memory (mb)"), :value => @record.hardware.memory_mb }
  end

  def textual_cores
    {:label => _("CPU total cores"), :value => @record.hardware.cpu_total_cores }
  end

  def textual_power_state
    {:label => _("Power State"), :value => @record.power_state}
  end

  def textual_mac
    # Currently, we only want to display the MAC addresses of devices that
    # are associated with an entry in the networks table. This ensures that
    # we only display management addresses.
    {:label =>  _("MAC Address"), :value => @record.hardware.guest_devices.reject { |device| device.network.nil? }.collect { |device| device[:address] }.join(", ") }
  end

  def textual_ipv4
    # It is possible for guest devices not to have network data (or a network
    # hash). As a result, we need to exclude guest devices that don't have
    # network data to prevent a nil class error from occurring.
    {:label =>  _("IPv4 Address"), :value => @record.hardware.guest_devices.reject { |device| device.network.nil? }.collect { |device| device.network.ipaddress }.join(", ") }
  end

  def textual_ipv6
    # It is possible for guest devices not to have network data (or a network
    # hash). As a result, we need to exclude guest devices that don't have
    # network data to prevent a nil class error from occurring.
    {:label =>  _("IPv6 Address"), :value => @record.hardware.guest_devices.reject { |device| device.network.nil? }.collect { |device| device.network.ipv6address }.join(", ") }
  end

  def textual_loc_led_state
    {:label => _("Identify LED State"), :value => @record.location_led_state}
  end

  def textual_support_contact
    {:label => _("Support contact"), :value => @record.asset_details['contact']}
  end

  def textual_description
    {:label => _("Description"), :value => @record.asset_details['description']}
  end

  def textual_location
    {:label => _("Location"), :value => @record.asset_details['location']}
  end

  def textual_room_id
    {:label => _("Room"), :value => @record.asset_details['room_id']}
  end

  def textual_rack_name
    {:label => _("Rack name"), :value => @record.asset_details['rack_name']}
  end

  def textual_lowest_rack_unit
    {:label => _("Lowest rack name"), :value => @record.asset_details['lowest_rack_unit']}
  end

  def textual_health_state
    {:label => _("Health State"), :value => @record.health_state}
  end

  def textual_fw_details
    fw_details = []
    @record.hardware.firmwares.each do |fw|
      fw_details.push(:label => fw.name, :value => fw.version)
    end

    {:value => fw_details}
  end
end
