module ConfigurationJobHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name description type status status_reason))
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i(provider service parameters status))
  end

  #
  # Items
  #
  def textual_type
    ui_lookup(:model => @record.type)
  end

  def textual_status
    @record.status
  end

  def textual_status_reason
    @record.status_reason
  end

  def textual_service
    h = {:label => _("Service"), :icon => "pficon pficon-service"}
    service = @record.service
    if service.nil?
      h[:value] = _("None")
    else
      h[:value] = service.name
      h[:title] = _("Show this Service")
      h[:link]  = url_for_only_path(:controller => 'service', :action => 'show', :id => to_cid(service.id))
    end
    h
  end

  def textual_provider
    h = {:label => _("Provider"), :image => "svg/vendor-ansible.svg"}
    provider = @record.ext_management_system
    if provider.nil?
      h[:value] = _("None")
    else
      h[:value] = provider.name
      h[:title] = _("Show this Parent Provider")
      h[:link]  = url_for_only_path(:controller => 'automation_manager', :action => 'explorer', :accordion => "automation_manager_providers", :id => "at-#{to_cid(provider.id)}")
    end
    h
  end

  def textual_parameters
    num   = @record.number_of(:parameters)
    h     = {:label => _("Parameters"), :icon => "product product-parameter", :value => num}
    if num > 0
      h[:link]  = url_for_only_path(:controller => controller.controller_name, :action => 'parameters', :id => @record)
      h[:title] = _("Show all parameters")
    end
    h
  end
end
