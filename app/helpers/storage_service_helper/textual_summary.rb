module StorageServiceHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        name description version
      ]
    )
  end

  def textual_group_capabilities
    capabilities = @record.capabilities.map do |c|
      [c.first, c.last]
    end

    TextualMultilabel.new(
      _("Capabilities"),
      :labels => [_("Capability"), _("Value")],
      :values => capabilities
    )
  end

  def textual_group_storage_resources
    resources = @record.storage_resources.map do |r|
      free_space = r.logical_total == 0 ? "N/A" : number_to_percentage(r.logical_free.to_f * 100 / r.logical_total.to_f, :precision => 1)
      [textual_link(r), number_to_human_size(r.logical_total), free_space]
    end

    TextualMultilabel.new(
      _("Storage Resources"),
      :labels => [_("Storage Resource"), _("Total Logical Space"), _("Free Logical Space (%)")],
      :values => resources
    )
  end

  def textual_group_cloud_volumes
    volumes = @record.cloud_volumes.map do |v|
      [textual_link(v), number_to_human_size(v.size), v.health_state, textual_link(v.storage_resource)]
    end

    TextualMiqDataTable.new(
      :headers => [_("Volume"), _("Size"), _("Health State"), _("Storage Resource")],
      :rows    => volumes
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems
      ]
    )
  end

  #
  # Items
  #

  def textual_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_description
    {:label => _("Description"), :value => @record.description}
  end

  def textual_version
    {:label => _("Service Version"), :value => @record.version}
  end

  def textual_ems
    textual_link(@record.ext_management_system)
  end
end
