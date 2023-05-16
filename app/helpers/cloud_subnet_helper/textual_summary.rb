module CloudSubnetHelper::TextualSummary
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[name type cidr gateway network_protocol dns_nameservers allocation_pools host_routes ip_version]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        parent_ems_cloud ems_network cloud_tenant availability_zone instances cloud_network
        network_router parent_subnet managed_subnets network_ports security_groups custom_button_events
      ]
    )
  end

  #
  # Items
  #
  def textual_type
    {:label => _('Type'), :value => ui_lookup(:model => @record.type)}
  end

  def textual_cidr
    {:label => _('CIDR'), :value => @record.cidr}
  end

  def textual_gateway
    @record.gateway
  end

  def textual_network_protocol
    @record.network_protocol
  end

  def textual_dns_nameservers
    @record.dns_nameservers_show
  end

  def textual_allocation_pools
    @record.allocation_pools&.map { |x| "<#{x['start']}, #{x['end']}>" }&.join(", ")
  end

  def textual_host_routes
    @record.host_routes&.map do |x|
      "destination: #{x['destination']}, nexthop: #{x['nexthop']}"
    end&.join(" | ")
  end

  def textual_ip_version
    @record.ip_version
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _('Parent Cloud Provider'))
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

  def textual_cloud_network
    textual_link(@record.cloud_network, :label => _('Cloud Network'))
  end

  def textual_cloud_tenant
    @record.cloud_tenant
  end

  def textual_network_router
    textual_link(@record.network_router, :label => _('Network Router'))
  end

  def textual_parent_subnet
    @record.parent_cloud_subnet
  end

  def textual_managed_subnets
    label = _("Managed Subnets")
    num   = @record.number_of(:cloud_subnets)
    h     = {:label => label, :icon => "ff ff-cloud-network", :value => num}
    if num.positive? && role_allows?(:feature => "cloud_subnet_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'cloud_subnets')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_availability_zone
    textual_link(@record.availability_zone, :label => _('Availability Zone'))
  end

  def textual_network_ports
    textual_link(@record.network_ports, :label => _('Network Ports'))
  end

  def textual_security_groups
    textual_link(@record.security_groups, :label => _('Security Groups'))
  end
end
