module AutomationManagerConfiguredSystemHelper
  include TextualMixins::TextualGroupTags

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[hostname ipmi_present ipaddress mac_address provider_name zone]
    )
  end

  def textual_hostname
    {:label => _("Hostname"),
     :icon  => "ff ff-configured-system",
     :value => @record.hostname}
  end

  def textual_ipmi_present
    {:label => _("IPMI Present"), :value => @record.ipmi_present}
  end

  def textual_ipaddress
    {:label => _("IP Address"), :value => @record.ipaddress}
  end

  def textual_mac_address
    {:label => _("Mac address"), :value => @record.mac_address}
  end

  def textual_provider_name
    {:label    => _("Provider"),
     :image    => @record.configuration_manager.decorate.fileicon,
     :value    => @record.configuration_manager.try(:name),
     :explorer => true}
  end

  def textual_zone
    {:label => _("Zone"), :value => @record.configuration_manager.my_zone}
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end
end
#
