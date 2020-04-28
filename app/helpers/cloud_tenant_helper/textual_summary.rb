module CloudTenantHelper::TextualSummary
  include TextualMixins::TextualEmsCloud
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name description])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems_cloud instances images cloud_object_store_containers
        cloud_volumes cloud_volume_snapshots cloud_networks cloud_subnets
        network_routers network_routers network_services security_groups security_policies
        floating_ips network_ports custom_button_events
      ]
    )
  end

  def textual_name
    @record.name
  end

  def textual_description
    @record.description
  end

  def textual_group_quotas
    quotas = @record.cloud_resource_quotas.order(:service_name, :name)
    q = quotas.collect { |quota| textual_quotas(quota) }
    TextualGroup.new(_("Quotas"), q)
  end

  #
  # Items
  #
  def textual_instances
    num   = @record.number_of(:vms)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Instances")
    end
    h
  end

  def textual_images
    num   = @record.number_of(:miq_templates)
    h     = {:label => _('Images'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "miq_template_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'images')
      h[:title] = _("Show all Images")
    end
    h
  end

  def textual_quotas(quota)
    label = quota_label(quota.service_name, quota.name)
    num   = quota.value.to_i
    used = quota.used.to_i < 0 ? "Unknown" : quota.used
    value = num < 0 ? "Unlimited" : "#{used} used of #{quota.value}"
    {:label => label, :value => value}
  end

  def quota_label(service_name, quota_name)
    "#{service_name.titleize} - #{quota_name.titleize}"
  end

  def textual_cloud_volumes
    label = _('Volumes')
    num   = @record.number_of(:cloud_volumes)
    h     = {:label => label, :icon => "pficon pficon-volume", :value => num}
    if num > 0 && role_allows?(:feature => "cloud_volume_show_list")
      h[:title] = _("Show all %{label}") % {:label => label}
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => "cloud_volumes")
    end
    h
  end

  def textual_cloud_volume_snapshots
    label = _('Volume Snapshots')
    num   = @record.number_of(:cloud_volume_snapshots)
    h     = {:label => label, :icon => "fa fa-camera", :value => num}
    if num > 0 && role_allows?(:feature => "cloud_volume_snapshot_show_list")
      h[:title] = _("Show all %{label}") % {:label => label}
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => "cloud_volume_snapshots")
    end
    h
  end

  def textual_cloud_object_store_containers
    num   = @record.number_of(:cloud_object_store_containers)
    h     = {:label => _('Cloud Object Store Containers'), :icon => "ff ff-cloud-object-store", :value => num}
    if num > 0 && role_allows?(:feature => "cloud_object_store_container_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'cloud_object_store_containers')
      h[:title] = _("Show all Cloud Object Store Containers")
    end
    h
  end

  def textual_security_groups
    textual_link(@record.security_groups, :label => _('Security Groups'))
  end

  def textual_security_policies
    textual_link(@record.security_policies, :label => _('Security Policies'))
  end

  def textual_floating_ips
    textual_link(@record.floating_ips, :label => _('Floating IPs'))
  end

  def textual_network_routers
    textual_link(@record.network_routers, :label => _('Network Routers'))
  end

  def textual_network_ports
    textual_link(@record.network_ports, :label => _('Network Ports'))
  end

  def textual_cloud_networks
    textual_link(@record.cloud_networks, :label => _('Cloud Networks'))
  end

  def textual_network_services
    textual_link(@record.network_services, :label => _('Network Services'))
  end

  def textual_cloud_subnets
    textual_link(@record.cloud_subnets, :label => _('Cloud Subnets'))
  end
end
