module ContainerReplicatorHelper::TextualSummary
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[name creation_timestamp resource_version replicas current_replicas]
    )
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[ems container_project container_groups container_nodes])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  #
  # Items
  #

  def textual_replicas
    {:label => _("Requested pods"), :icon => "fa fa-cubes", :value => @record.replicas}
  end

  def textual_current_replicas
    {:label => _("Current pods"), :icon => "fa fa-cubes", :value => @record.current_replicas}
  end

  def textual_compliance_history
    super(:title => _("Show Compliance History of this Replicator (Last 10 Checks)"))
  end
end
