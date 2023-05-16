module PhysicalRackHelper::TextualSummary
  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[name ems_ref]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[ext_management_system physical_chassis physical_servers physical_storages]
    )
  end

  def textual_ext_management_system
    textual_link(ExtManagementSystem.find(@record.ems_id))
  end

  def textual_name
    {:label => _("Rack name"), :value => @record.name}
  end

  def textual_ems_ref
    {:label => _("UUID"), :value => @record.ems_ref}
  end

  def textual_physical_chassis
    textual_link(@record.physical_chassis)
  end

  def textual_physical_servers
    textual_link(@record.physical_servers)
  end

  def textual_physical_storages
    textual_link(@record.physical_storages)
  end
end
