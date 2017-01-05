module DatawarehouseNodeHelper::TextualSummary
  include TextualMixins::TextualName
  #
  # Groups
  #

  def textual_group_properties
    %i(name creation_timestamp resource_version)
  end

  def textual_group_relationships
    %i(ems)
  end

  #
  # Items
  #
  def textual_creation_timestamp
    format_timezone(@record.ems_created_on)
  end

  def textual_resource_version
    @record.resource_version
  end

  def textual_path
    @record.path
  end
end

