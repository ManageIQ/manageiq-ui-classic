module SecurityGroupHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i(description type))
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i(parent_ems_cloud ems_network cloud_tenant instances orchestration_stack network_ports)
    )
  end

  def textual_group_firewall
    return nil if @record.firewall_rules.empty?

    items = @record.firewall_rules.collect do |rule|
      [
        rule.network_protocol,
        rule.host_protocol,
        rule.direction,
        rule.port,
        rule.end_port,
        (rule.source_ip_range || rule.source_security_group.try(:name) || "<None>")
      ]
    end.sort

    TextualTable.new(
      _("Firewall Rules"),
      items,
      [_("Network Protocol"), _("Host Protocol"), _("Direction"), _("Port"), _("End Port"), _("Source")]
    )
  end

  #
  # Items
  #
  def textual_type
    ui_lookup(:model => @record.type)
  end

  def textual_parent_ems_cloud
    @record.ext_management_system.try(:parent_manager)
  end

  def textual_instances
    label = ui_lookup(:tables => "vm_cloud")
    num   = @record.number_of(:vms)
    h     = {:label => label, :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all %{label}") % {:label => label}
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
end
