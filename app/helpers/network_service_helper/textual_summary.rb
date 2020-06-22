module NetworkServiceHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualEmsNetwork
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name description type ems_ref])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems_network cloud_tenant security_policy_rule custom_button_events
      ]
    )
  end

  def textual_group_entries
    return nil if @record.entries.empty?

    items = @record.entries.collect do |entry|
      [
        entry.protocol,
        entry.source_ports,
        entry.destination_ports
      ]
    end.sort

    TextualTable.new(
      _("Network Service Entries"),
      items,
      [_("Protocol"), _("Source Ports"), _("Destination Ports")]
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

  def textual_cloud_tenant
    textual_link(@record.cloud_tenant, :label => _('Cloud Tenant'))
  end

  def textual_security_policy_rule
    textual_link(@record.security_policy_rules, :label => _("Security Policy Rules"))
  end
end
