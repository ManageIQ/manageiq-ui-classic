module MiddlewareDeploymentHelper::TextualSummary
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name status nativeid))
  end

  def textual_group_relationships
    # Order of items should be from parent to child
    TextualGroup.new(_("Relationships"), %i(ems middleware_server))
  end

  def textual_status
    @record.status
  end
end
