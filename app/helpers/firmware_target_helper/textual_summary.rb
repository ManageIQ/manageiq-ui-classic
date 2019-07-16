module FirmwareTargetHelper::TextualSummary
  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[manufacturer model created updated]
    )
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[firmware_binaries])
  end

  def textual_created
    {:label => _("Created On"), :value => format_timezone(@record.created_at)}
  end

  def textual_updated
    {:label => _("Updated On"), :value => format_timezone(@record.updated_at)}
  end

  def textual_manufacturer
    @record.manufacturer
  end

  def textual_model
    @record.model
  end

  def textual_firmware_binaries
    textual_link(@record.firmware_binaries)
  end
end
