module ContainerRouteHelper::TextualSummary
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name creation_timestamp resource_version host_name path))
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(ems container_project container_service container_groups container_nodes))
  end

  def textual_group_smart_management
    items = %w(tags)
    i = items.collect { |m| send("textual_#{m}") }.flatten.compact
    TextualGroup.new(_("Smart Management"), i)
  end

  #
  # Items
  #

  def textual_host_name
    @record.host_name
  end

  def textual_path
    @record.path
  end
end
