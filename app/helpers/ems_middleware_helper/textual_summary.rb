module EmsMiddlewareHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name type hostname port))
  end

  def textual_group_relationships
    # Order of items should be from parent to child
    TextualGroup.new(
      _("Relationships"),
      %i(middleware_domains middleware_servers middleware_deployments)
    )
  end

  def textual_group_status
    TextualGroup.new(_("Status"), %i(authentication_status refresh_status refresh_date))
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i(tags))
  end
  
  #
  # Items
  #

  def textual_name
    @record.name
  end

  def textual_type
    @record.emstype_description
  end

  def textual_hostname
    @record.hostname
  end

  def textual_port
    @record.supports_port? ? @record.port : nil
  end

  def textual_authentication_status
    auth_status = @record.authentication_for_summary.first

    short_status = auth_status[:status] || _('None')
    "#{short_status} - #{auth_status[:status_details]}" unless auth_status[:status_details].blank?
  end
end
