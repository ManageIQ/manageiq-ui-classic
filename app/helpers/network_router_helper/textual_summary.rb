module NetworkRouterHelper::TextualSummary
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name type status))
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i(parent_ems_cloud ems_network cloud_tenant instances cloud_subnets external_gateway)
    )
  end

  #
  # Items
  #
  def textual_type
    {:label => _('Type'), :value => ui_lookup(:model => @record.type)}
  end

  def textual_status
    @record.status
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _('Cloud Provider'))
  end

  def textual_instances
    label = ui_lookup(:tables => "vm_cloud")
    num   = @record.number_of(:vms)
    h     = {:label => label, :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_cloud_tenant
    textual_link(@record.cloud_tenant, :label => _('Cloud Tenant'))
  end

  def textual_cloud_subnets
    textual_link(@record.cloud_subnets, :label => _('Cloud Subnets'))
  end

  def textual_external_gateway
    textual_link(@record.cloud_network, :label => _('Cloud Network'))
  end
end
