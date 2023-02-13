module StorageResourceHelper::TextualSummary
  include TextualMixins::TextualGroupTags

  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        name
        logical_free
        logical_total
      ]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[ems physical_storage]
    )
  end

  #
  # Items
  #

  def textual_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_logical_free
    {:label => _("Free Space"), :value => number_to_human_size(@record.logical_free, :precision => 2)}
  end

  def textual_logical_total
    {:label => _("Total Size"), :value => number_to_human_size(@record.logical_total, :precision => 2)}
  end

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_physical_storage
    textual_link(@record.physical_storage)
  end

  def textual_group_capabilities
    capabilities = @record.capabilities.flat_map do |key, values|
      values.map { |value| [key, value] }
    end

    TextualMultilabel.new(
      _("Capabilities"),
      :labels => [_("Capability"), _("Value")],
      :values => capabilities
    )
  end

  def textual_group_storage_services
    services = @record.storage_services.map do |s|
      [textual_link(s), s.description]
    end

    TextualMultilabel.new(
      _("Storage Services"),
      :labels => [_("Storage Service"), _("Description")],
      :values => services
    )
  end

  def textual_group_cloud_volumes
    volumes = @record.cloud_volumes.map do |v|
      [textual_link(v), number_to_human_size(v.size), v.health_state, textual_link(v.storage_service)]
    end

    TextualMultilabel.new(
      _("Volumes"),
      :labels => [_("Volume"), _("Size"), _("Health State"), _("Storage Service")],
      :values => volumes
    )
  end
end
