module OrchestrationStackHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualEmsCloud
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name description type status status_reason])
  end

  def textual_group_lifecycle
    TextualGroup.new(_("Lifecycle"), %i[retirement_date])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems_cloud service parent_orchestration_stack child_orchestration_stack orchestration_template
        instances security_groups cloud_networks parameters outputs resources
      ]
    )
  end

  #
  # Items
  #
  def textual_type
    {:label => _('Type'), :value => ui_lookup(:model => @record.type)}
  end

  def textual_status
    {:label => _('Status'), :value => @record.status}
  end

  def textual_status_reason
    {:label => _('Status Reason'), :value => @record.status_reason}
  end

  def textual_retirement_date
    {:label => _("Retirement Date"),
     :icon  => "fa fa-clock-o",
     :value => (@record.retires_on.nil? ? _("Never") : @record.retires_on.strftime("%x %R %Z"))}
  end

  def textual_service
    h = {:label => _("Service"), :icon => "pficon pficon-service"}
    service = @record.service || @record.try(:root).try(:service)
    if service.nil?
      h[:value] = _("None")
    else
      h[:value] = service.name
      h[:title] = _("Show this Service")
      h[:link]  = url_for_only_path(:controller => 'service', :action => 'show', :id => service)
    end
    h
  end

  def textual_parent_orchestration_stack
    @record.parent
  end

  def textual_child_orchestration_stack
    num = @record.number_of(:children)
    if num == 1 && role_allows?(:feature => "orchestration_stack_show")
      @record.children.first
    elsif num > 1 && role_allows?(:feature => "orchestration_stack_show_list")
      h         = {:label => _("Child Orchestration Stacks"), :icon => "ff ff-stack", :value => num}
      h[:link]  = url_for_only_path(:action => 'show', :id => @record.id, :display => 'children')
      h[:title] = _("Show all Child Orchestration Stacks")
      h
    end
  end

  def textual_orchestration_template
    template = @record.try(:orchestration_template)
    return nil if template.nil?
    h = {:label => _('Orchestration Template'), :icon => "pficon pficon-template", :value => template.name}
    if role_allows?(:feature => "orchestration_templates_view")
      h[:title] = _("Show this Orchestration Template")
      h[:link] = url_for_only_path(:action => 'show', :id => @record, :display => 'stack_orchestration_template')
    end
    h
  end

  def textual_instances
    num   = @record.number_of(:vms)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Instances")
    end
    h
  end

  def textual_security_groups
    @record.security_groups
  end

  def textual_cloud_networks
    num = @record.number_of(:cloud_networks)
    return nil if num <= 0
    {:label => _('Cloud Networks'), :icon => "ff ff-cloud-network", :value => num}
  end

  def textual_parameters
    num   = @record.number_of(:parameters)
    h     = {:label => _("Parameters"), :icon => "ff ff-parameter", :value => num}
    if num.positive?
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'parameters', :id => @record)
      h[:title] = _("Show all parameters")
    end
    h
  end

  def textual_outputs
    num   = @record.number_of(:outputs)
    h     = {:label => _("Outputs"), :icon => "ff ff-file-output-o", :value => num}
    if num.positive?
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'outputs', :id => @record)
      h[:title] = _("Show all outputs")
    end
    h
  end

  def textual_resources
    num   = @record.number_of(:resources)
    h     = {:label => _("Resources"), :icon => "ff ff-resource", :value => num}
    if num.positive?
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'resources', :id => @record)
      h[:title] = _("Show all resources")
    end
    h
  end
end
