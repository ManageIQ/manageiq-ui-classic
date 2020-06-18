module SecurityGroupHelper::TextualSummary
  include TextualMixins::TextualName
  include TextualMixins::TextualDescription
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name description type])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        parent_ems_cloud ems_network cloud_tenant instances orchestration_stack network_ports network_router
        cloud_subnet custom_button_events
      ]
    )
  end

  def textual_group_security_policy_rules
    return nil if @record.security_policy_rules_as_source.empty? && @record.security_policy_rules_as_destination.empty?

    TextualGroup.new(
      _("Security Policy Rules"),
      %i[
        security_policy_rules_as_source security_policy_rules_as_destination
      ]
    )
  end

  def textual_group_firewall
    return nil if @record.firewall_rules.empty?

    items = @record.firewall_rules.collect do |rule|
      [
        rule.network_protocol,
        rule.host_protocol,
        rule.direction,
        port_range_helper(rule),
        (rule.source_ip_range || rule.source_security_group.try(:name) || "<None>")
      ]
    end.sort

    TextualTable.new(
      _("Firewall Rules"),
      items,
      [_("Network Protocol"), _("Host Protocol"), _("Direction"), _("Port Range"), _("Source")]
    )
  end

  #
  # Items
  #
  def textual_type
    ui_lookup(:model => @record.type)
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_instances
    num   = @record.number_of(:vms)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Instances")
    end
    h
  end

  def textual_orchestration_stack
    @record.orchestration_stack
  end

  def textual_cloud_tenant
    @record.cloud_tenant
  end

  def textual_network_ports
    @record.network_ports
  end

  def textual_network_router
    @record.network_router
  end

  def textual_cloud_subnet
    @record.cloud_subnet
  end

  def port_range_helper(rule)
    if rule.host_protocol.to_s.upcase.include?("ICMP")
      _("N/A")
    elsif rule.port.nil? && rule.end_port.nil?
      _("All")
    elsif rule.port == rule.end_port
      rule.port.to_s
    else
      rule.port_range.to_s(:dash)
    end
  end
end
