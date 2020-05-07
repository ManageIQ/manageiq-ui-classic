module SecurityPolicyHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #
  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[description type ems_ref sequence_number])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems_network cloud_tenant custom_button_events
      ]
    )
  end

  def textual_group_security_policy_rules
    return nil if @record.security_policy_rules.empty?

    items = @record.security_policy_rules.collect do |rule|
      link = url_for_only_path(:controller => 'security_policy_rule', :action => 'show', :id => rule)
      [
        {:link => link, :value => rule.name},
        {:link => link, :value => rule.source_security_groups.count.to_s},
        {:link => link, :value => rule.destination_security_groups.count.to_s},
        {:link => link, :value => rule.network_services.count.to_s}
      ]
    end

    TextualTable.new(
      _("Rules"),
      items,
      [_("Name"), _("Source Groups"), _("Destination Groups"), _("Network Services")]
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

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_cloud_tenant
    textual_link(@record.cloud_tenant, :label => _('Cloud Tenant'))
  end
end
