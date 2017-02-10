module ContainerReplicatorHelper::TextualSummary
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i(name creation_timestamp resource_version replicas current_replicas)
    )
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(ems container_project container_groups container_nodes))
  end

  def textual_group_smart_management
    items = %w(tags)
    i = items.collect { |m| send("textual_#{m}") }.flatten.compact
    TextualTags.new(_("Smart Management"), i)
  end

  #
  # Items
  #

  def textual_replicas
    {:label => _("Requested pods"), :value => @record.replicas}
  end

  def textual_current_replicas
    {:label => _("Current pods"), :value => @record.current_replicas}
  end

  def textual_compliance_history
    super(:title => _("Show Compliance History of this Replicator (Last 10 Checks)"))
  end
end
