module MiddlewareDomainHelper::TextualSummary
  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name nativeid state))
  end

  def textual_state
    @record.properties['Availability']
  end

  def textual_group_relationships
    # Order of items should be from parent to child
    TextualGroup.new(_("Relationships"), %i(ems middleware_server_groups))
  end
end
