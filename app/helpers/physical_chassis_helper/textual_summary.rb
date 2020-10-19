module PhysicalChassisHelper::TextualSummary
  #
  # Textual Groups
  # Properties, Relationships, Management Network, Slots
  #
  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[name product_name manufacturer serial_number part_number health_state uid_ems description location_led_state]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[ext_management_system physical_rack physical_servers physical_storages]
    )
  end

  def textual_group_management_network
    TextualGroup.new(
      _("Management Network"),
      %i[ipaddress]
    )
  end

  def textual_group_slots
    TextualGroup.new(
      _("Chassis Slots"),
      %i[mm_slot_count switch_slot_count fan_slot_count blade_slot_count powersupply_slot_count]
    )
  end

  #
  # Properties
  #
  def textual_name
    {:label => _("Chassis name"), :value => @record.name }
  end

  def textual_product_name
    {:label => _("Product Name"), :value => @record.asset_detail&.product_name}
  end

  def textual_manufacturer
    {:label => _("Manufacturer"), :value => @record.asset_detail&.manufacturer}
  end

  def textual_serial_number
    {:label => _("Serial Number"), :value => @record.asset_detail&.serial_number}
  end

  def textual_part_number
    {:label => _("Part Number"), :value => @record.asset_detail&.part_number}
  end

  def textual_health_state
    {:label => _("Health State"), :value => @record.health_state}
  end

  def textual_uid_ems
    {:label => _("UUID"), :value => @record.uid_ems }
  end

  def textual_description
    {:label => _("Description"), :value => @record.asset_detail&.description}
  end

  def textual_location_led_state
    {:label => _("Identify LED State"), :value => @record.asset_detail&.location_led_state}
  end

  #
  # Relashionships
  #
  def textual_ext_management_system
    textual_link(ExtManagementSystem.find(@record.ems_id))
  end

  def textual_physical_rack
    textual_link(@record.physical_rack)
  end

  def textual_physical_servers
    textual_link(@record.physical_servers)
  end

  def textual_physical_storages
    textual_link(@record.physical_storages)
  end

  #
  # Management Network
  #
  def textual_ipaddress
    {:label => _("IP"), :value => (@record.guest_devices.detect { |device| device.device_type == "management" })&.network&.ipaddress}
  end

  #
  # Chassis Slots
  #
  def textual_mm_slot_count
    {:label => _("Management Module Slot Count"), :value => @record.management_module_slot_count}
  end

  def textual_switch_slot_count
    {:label => _("Switch Slot Count"), :value => @record.switch_slot_count}
  end

  def textual_fan_slot_count
    {:label => _("Fan Slot Count"), :value => @record.fan_slot_count}
  end

  def textual_blade_slot_count
    {:label => _("Blade Slot Count"), :value => @record.blade_slot_count}
  end

  def textual_powersupply_slot_count
    {:label => _("Power Supply Slot Count"), :value => @record.powersupply_slot_count}
  end
end
