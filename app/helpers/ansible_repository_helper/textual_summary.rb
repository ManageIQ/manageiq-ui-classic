module AnsibleRepositoryHelper::TextualSummary
  include TextualMixins::TextualName
  include TextualMixins::TextualDescription

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name description created updated))
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(provider playbooks credential))
  end

  def textual_group_options
    TextualGroup.new(_("Repository Options"), %i(scm_type scm_url scm_branch scm_clean scm_delete_on_update scm_update_on_launch))
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
      h.update(:link  => url_for_only_path(:action => 'show', :id => @record, :display => 'playbooks'),
               :title => _('Show all Playbooks'))
    end
    h
  end

  def textual_credential
    h = {:label => _('Credential')}
    if @record.try(:authentication) && role_allows?(:feature => 'embedded_automation_manager_credentials_view')
      h.update(:link  => url_for_only_path(:controller => 'ansible_credential',
                                 :action     => 'show',
                                 :id         => @record.authentication),
               :title => _('Show Credential'),
               :value => @record.authentication.name)
    end
    h
  end

  def textual_scm_type
    {:label => _('SCM Type'), :title => _("Show Credential's SCM type"), :value => @record.scm_type}
  end

  def textual_scm_url
    {:label => _('SCM URL'), :title => _("Show Credential's SCM URL"), :value => @record.scm_url}
  end

  def textual_scm_branch
    {:label => _('SCM Branch'), :title => _("Show Credential's SCM branch"), :value => @record.scm_branch}
  end

  def textual_scm_clean
    {:label => _('SCM Clean'), :title => _("Show Credential's SCM clean flag"), :value => @record.scm_clean}
  end

  def textual_scm_delete_on_update
    {:label => _('SCM Delete on Update'), :title => _("Show Credential's SCM delete on update flag"), :value => @record.scm_delete_on_update}
  end

  def textual_scm_update_on_launch
    {:label => _('SCM Update on Launch'), :title => _("Show Credential's SCM update on launch flag"), :value => @record.scm_update_on_launch}
  end
end
