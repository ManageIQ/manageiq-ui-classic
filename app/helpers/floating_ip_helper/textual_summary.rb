module FloatingIpHelper::TextualSummary
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[address type fixed_ip_address status])
  end

  def textual_group_relationships
    TextualGroup.new(_("Relationships"), %i[parent_ems_cloud ems_network cloud_tenant instance network_port network_router cloud_network])
  end

  #
  # Items
  #

  def textual_address
    @record.address
  end

  def textual_type
    ui_lookup(:model => @record.type)
  end

  def textual_fixed_ip_address
    @record.fixed_ip_address
  end

  def textual_status
    @record.status
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_instance
    return unless @record.vm

    instance = @record.vm
    h        = {:label => _('Instance'), :icon => "pficon pficon-virtual-machine"}
    if instance && role_allows?(:feature => "vm_show")
      h[:value] = instance.name
      h[:link]  = url_for_only_path(:controller => 'vm_cloud', :action => 'show', :id => instance.id)
      h[:title] = _("Show Instance")
    end
    h
  end

  def textual_cloud_tenant
    @record.cloud_tenant
  end

  def textual_network_port
    @record.network_port
  end

  def textual_network_router
    textual_link(@record.network_router, :label => _('Network Router'))
  end

  def textual_cloud_network
    textual_link(@record.cloud_network, :label => _("Cloud Network"))
  end
end
