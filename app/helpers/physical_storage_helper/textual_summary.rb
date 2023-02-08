module PhysicalStorageHelper::TextualSummary
  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[name product_name serial_number health_state enclosures drive_bays uid_ems description]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[ext_management_system physical_rack physical_chassis]
    )
  end

  def textual_group_asset_details
    TextualGroup.new(
      _("Asset Details"),
      %i[machine_type model contact location room rack_name lowest_rack_unit]
    )
  end

  def textual_physical_rack
    rack_id = @record.physical_rack_id
    return nil if rack_id.nil?

    textual_link(PhysicalRack.find(rack_id))
  end

  def textual_physical_chassis
    chassis_id = @record.physical_chassis_id
    return nil if chassis_id.nil?

    textual_link(PhysicalChassis.find(chassis_id))
  end

  def textual_ext_management_system
    textual_link(ExtManagementSystem.find(@record.ems_id))
  end

  def textual_name
    {:label => _("Name"), :value => @record.name }
  end

  def textual_product_name
    {:label => _("Product Name"), :value => @record.asset_detail&.product_name}
  end

  def textual_serial_number
    {:label => _("Serial Number"), :value => @record.asset_detail&.serial_number}
  end

  def textual_health_state
    {:label => _("Health State"), :value => @record.health_state}
  end

  def textual_enclosures
    {:label => _("Enclosure Count"), :value => @record.enclosures}
  end

  def textual_drive_bays
    {:label => _("Drive Bays"), :value => @record.drive_bays}
  end

  def textual_uid_ems
    {:label => _("UUID"), :value => @record.uid_ems }
  end

  def textual_description
    {:label => _("Description"), :value => @record.asset_detail&.description}
  end

  def textual_machine_type
    {:label => _("Machine Type"), :value => @record.asset_detail&.machine_type}
  end

  def textual_model
    {:label => _("Model"), :value => @record.asset_detail&.model}
  end

  def textual_contact
    {:label => _("Contact"), :value => @record.asset_detail&.contact}
  end

  def textual_location
    {:label => _("Location"), :value => @record.asset_detail&.location}
  end

  def textual_room
    {:label => _("Room"), :value => @record.asset_detail&.room}
  end

  def textual_rack_name
    {:label => _("Rack Name"), :value => @record.asset_detail&.rack_name}
  end

  def textual_lowest_rack_unit
    {:label => _("Lowest Rack Unit"), :value => @record.asset_detail&.lowest_rack_unit}
  end
end
