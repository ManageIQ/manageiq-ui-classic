module CloudVolumeTypeHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name description backend_name))
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(parent_ems_cloud ems_storage))
  end

  def textual_backend_name
    @record.backend_name.to_s
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_ems_storage
    textual_link(@record.ext_management_system)
  end
end
