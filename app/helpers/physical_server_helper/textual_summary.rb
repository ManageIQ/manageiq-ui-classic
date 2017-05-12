module PhysicalServerHelper::TextualSummary
  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i(name model product_name manufacturer machine_type serial_number ems_ref memory cores)
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i(host ext_management_system)
    )
  end

  def textual_group_power_management
    TextualGroup.new(
      _("Power Management"),
      %i(power_state)
    )
  end

  def textual_group_compliance
  end

  def textual_group_networks
    TextualGroup.new(_("Networks"), %i(mac ipv4 ipv6))
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
    {:label =>  _("Mac Address"), :value => @record.hardware.guest_devices.collect { |device| device[:address] }.join(", ") }
  end

  def textual_ipv4
    {:label =>  _("IPV4 Address"), :value => @record.hardware.guest_devices.collect { |device| device.network.ipaddress }.join(", ") }
  end

  def textual_ipv6
    {:label =>  _("IPV6 Address"), :value => @record.hardware.guest_devices.collect { |device| device.network.ipv6address }.join(", ") }
  end
end
