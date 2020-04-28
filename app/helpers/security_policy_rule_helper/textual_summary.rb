module SecurityPolicyRuleHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualDescription
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[
        description
        type
        ems_ref
        sequence_number
        status
        action
        direction
        ip_protocol
      ]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems_network
        cloud_tenant
        security_policy
        custom_button_events
      ]
    )
  end

  def textual_group_source
    TextualGroup.new(
      _("Source"),
      %i[
        source_security_group
        source_vms
      ]
    )
  end

  def textual_group_destination
    TextualGroup.new(
      _("Destination"),
      %i[
        destination_security_group
        destination_vms
      ]
    )
  end

  def textual_group_network_services
    TextualGroup.new(
      _("Network Services"),
      %i[
        network_service
      ]
    )
  end

  #
  # Items
  #
  def textual_type
    {:label => _('Type'), :value => ui_lookup(:model => @record.type)}
  end

  def textual_ems_ref
    return nil if @record.ems_ref.blank?
    {:label => _("ID within Provider"), :value => @record.ems_ref}
  end

  def textual_sequence_number
    {:label => _('Sequence Number'), :value => ui_lookup(:model => @record.sequence_number.to_s)}
  end

  def textual_status
    {:label => _('Status'), :value => ui_lookup(:model => @record.status)}
  end

  def textual_action
    {:label => _('Action'), :value => ui_lookup(:model => @record.action)}
  end

  def textual_direction
    {:label => _('Direction'), :value => ui_lookup(:model => @record.direction)}
  end

  def textual_ip_protocol
    {:label => _('IP protocol'), :value => ui_lookup(:model => @record.ip_protocol)}
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_cloud_tenant
    textual_link(@record.cloud_tenant, :label => _('Cloud Tenant'))
  end

  def textual_security_policy
    textual_link(@record.security_policy, :label => _('Security Policy'))
  end

  def textual_source_security_group
    textual_link(@record.source_security_groups, :label => _('Security Groups'))
  end

  def textual_source_vms
    num   = @record.number_of(:source_vms)
    h     = {:label => _('Virtual Machines'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Source Virtual Machines")
    end
    h
  end

  def textual_destination_security_group
    textual_link(@record.destination_security_groups, :label => _('Security Groups'))
  end

  def textual_destination_vms
    num   = @record.number_of(:destination_vms)
    h     = {:label => _('Virtual Machines'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
      h[:title] = _("Show all Destination Virtual Machines")
    end
    h
  end

  def textual_network_service
    textual_link(@record.network_services, :label => _('Network Services'))
  end
end
