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
    TextualGroup.new(_("Relationships"), %i(middleware_domains middleware_servers middleware_deployments middleware_datasources
      middleware_messagings))
  end

  def textual_group_status
    TextualGroup.new(_("Status"), %i(refresh_status))
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i(tags))
  end

  def textual_group_topology
    items = %w(topology)
    i = items.collect { |m| send("textual_#{m}") }.flatten.compact
    TextualGroup.new(_("Overview"), i)
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

  def textual_topology
    {:label => _('Topology'),
     :icon  => "pficon pficon-topology",
     :link  => url_for(:controller => 'middleware_topology', :action => 'show', :id => @record.id),
     :title => _('Show topology')}
  end
end
