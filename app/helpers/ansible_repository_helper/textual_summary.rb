module AnsibleRepositoryHelper::TextualSummary
  include TextualMixins::TextualName
  include TextualMixins::TextualDescription

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name description created updated))
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(provider playbooks credential))
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

  def textual_credential
    h = {:label => _('Credential')}
    if @record.try(:authentication) && role_allows?(:feature => 'embedded_automation_manager_credentials_view')
      h.update(:link  => url_for(:controller => 'ansible_credential',
                                 :action     => 'show',
                                 :id         => @record.authentication),
               :title => _('Show Credential'),
               :value => @record.authentication.name)
    end
    h
  end
end
