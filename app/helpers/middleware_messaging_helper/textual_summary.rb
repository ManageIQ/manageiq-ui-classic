module MiddlewareMessagingHelper::TextualSummary
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name nativeid messaging_type))
  end

  def textual_group_relationships
    # Order of items should be from parent to child
    TextualGroup.new(_("Relationships"), %i(ems middleware_server))
  end

  def textual_messaging_type
    @record.messaging_type
  end
end
