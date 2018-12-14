module LoadBalancerHelper::TextualSummary
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(name type description listeners health_checks))
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i(parent_ems_cloud ems_network cloud_tenant instances network_ports floating_ips security_groups custom_button_events)
    )
  end

  #
  # Items
  #

  def textual_type
    ui_lookup(:model => @record.type)
  end

  def textual_description
    @record.description
  end

  def textual_listeners
    if @record.load_balancer_listeners
      @record.load_balancer_listeners.map do |x|
        "Load Balancer"\
          " #{LoadBalancerHelper.display_protocol_port_range(x.load_balancer_protocol, x.load_balancer_port_range)}"\
          ", Instance"\
          " #{LoadBalancerHelper.display_protocol_port_range(x.instance_protocol, x.instance_port_range)}"
      end.join(" | ")
    end
  end

  def textual_health_checks
    if @record.load_balancer_health_checks
      @record.load_balancer_health_checks.map do |x|
        "#{x.protocol}:#{x.port}/#{x.url_path}"
      end.join("\n")
    end
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_cloud_tenant
    @record.cloud_tenant
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

  def textual_network_ports
    @record.network_ports
  end

  def textual_floating_ips
    @record.floating_ips
  end

  def textual_security_groups
    @record.security_groups
  end
end
