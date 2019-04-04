module ContainerTemplateHelper::TextualSummary
  #
  # Groups
  #
  include TextualMixins::TextualCustomButtonEvents

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name creation_timestamp resource_version])
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[ems container_project custom_button_events])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end

  def textual_group_objects
    labels = [_("Kind"), _("Name*")]
    values = @record.objects.collect { |obj| [obj[:kind], obj[:metadata][:name] || obj[:metadata][:generateName]] }
    TextualMultilabel.new(_("Objects"), :labels => labels, :values => values)
  end

  def textual_group_parameters
    labels = [_("Name"), _("Value"), _("Required")]
    values = @record.container_template_parameters.reorder('required').collect do |param|
      req = param.required || false
      req = 'auto-generated' if param.generate.present?
      [param.name, param.value, req]
    end
    TextualMultilabel.new(_("Parameters"), :labels => labels, :values => values)
  end
end
