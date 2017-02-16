module AnsibleRepositoryHelper::TextualSummary
  include TextualMixins::TextualName
  include TextualMixins::TextualDescription

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name description created updated))
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(provider playbooks))
  end

  def textual_created
    {:label => _("Created On"), :value => format_timezone(@record.created_at)}
  end

  def textual_updated
    {:label => _("Updated On"), :value => format_timezone(@record.updated_at)}
  end

  def textual_provider
    @record.manager.try(:name)
  end

  def textual_playbooks
    h = {:label => _('Playbooks'), :value => @record.total_payloads}
    if @record.total_payloads > 0 && role_allows?(:feature => 'embedded_configuration_script_payload_view')
      h.update(:link  => url_for(:action => 'show', :id => @record, :display => 'playbooks'),
               :title => _('Show all Playbooks'))
    end
    h
  end
end
