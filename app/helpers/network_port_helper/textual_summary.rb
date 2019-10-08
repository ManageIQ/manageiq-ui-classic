module NetworkPortHelper::TextualSummary
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[name mac_address type device_owner floating_ip_addresses fixed_ip_addresses]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[parent_ems_cloud ems_network cloud_tenant device cloud_subnets floating_ips security_groups host]
    )
  end

  #
  # Items
  #
  def textual_mac_address
    @record.mac_address
  end

  def textual_type
    ui_lookup(:model => @record.type)
  end

  def textual_device_owner
    @record.device_owner
  end

  def textual_fixed_ip_addresses
    @record.fixed_ip_addresses&.join(", ")
  end

  def textual_floating_ip_addresses
    @record.floating_ip_addresses&.join(", ")
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_device
    device = @record.device
    if device.kind_of?(VmOrTemplate)
      instance = @record.device
      h        = nil
      if instance && role_allows?(:feature => "vm_show")
        h         = {:label => _('Instance'), :icon => "pficon pficon-virtual-machine"}
        h[:value] = instance.name
        h[:link]  = url_for_only_path(:controller => 'vm_cloud', :action => 'show', :id => instance.id)
        h[:title] = _("Show Instance")
      end
      h
    elsif device.kind_of?(LoadBalancer)
      device.name
    else
      device
    end
  end

  def textual_cloud_tenant
    @record.cloud_tenant
  end

  def textual_cloud_subnets
    @record.cloud_subnets
  end

  def textual_floating_ips
    @record.floating_ips
  end

  def textual_security_groups
    @record.security_groups
  end

  def textual_host
    return nil unless @record.device_type == "Host"
    {
      :icon  => "pficon pficon-container-node",
      :value => @record.device,
      :link  => url_for_only_path(
        :controller => "host",
        :action     => "show",
        :id         => @record.device.id
      )
    }
  end
end
