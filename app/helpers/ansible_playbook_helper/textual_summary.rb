module AnsiblePlaybookHelper::TextualSummary
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualDescription

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name description created updated])
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[provider repository])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  def textual_created
    {:label => _("Created On"), :value => format_timezone(@record.created_at)}
  end

  def textual_updated
    {:label => _("Updated On"), :value => format_timezone(@record.updated_at)}
  end

  def textual_provider
    {:label => _("Provider"), :value => @record.manager.try(:name)}
  end

  def textual_repository
    h = {:label => _("Repository")}
    if role_allows?(:feature => "embedded_configuration_script_source_view") && @record.configuration_script_source.try(:name)
      h.update(:value => @record.configuration_script_source.name,
               :icon  => "pficon pficon-repository",
               :link  => url_for_only_path(:controller => 'ansible_repository', :action => 'show', :id => @record.configuration_script_source),
               :title => _("Show Repository"))
    end
    h
  end
end
