module CloudNetworkHelper::TextualSummary
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualDescription
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name description type status ems_ref])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[parent_ems_cloud ems_network cloud_tenant instances cloud_subnets network_routers floating_ips custom_button_events]
    )
  end

  #
  # Items
  #
  def textual_type
    {:label => _('Type'), :value => ui_lookup(:model => @record.type)}
  end

  def textual_status
    {:label => _("Status"), :value => _(@record.status)}
  end

  def textual_ems_ref
    return nil if @record.ems_ref.blank?

    {:label => _("ID within Provider"), :value => @record.ems_ref}
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_instances
    num   = @record.number_of(:vms)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _('Show all Instances')
    end
    h
  end

  def textual_cloud_tenant
    textual_link(@record.cloud_tenant, :label => _('Cloud Tenant'))
  end

  def textual_network_routers
    textual_link(@record.network_routers, :label => _('Network Routers'))
  end

  def textual_cloud_subnets
    textual_link(@record.cloud_subnets, :label => _('Cloud Subnets'))
  end

  def textual_floating_ips
    textual_link(@record.floating_ips, :label => _("Floating IPs"))
  end
end
