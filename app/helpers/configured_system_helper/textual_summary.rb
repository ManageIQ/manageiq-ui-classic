module ConfiguredSystemHelper::TextualSummary
  include TextualMixins::TextualGroupTags

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[hostname ipmi_present ipaddress mac_address configuration_profile_desc provider_name zone]
    )
  end

  def textual_hostname
    {
      :label => _("Hostname"),
      :icon  => "ff ff-configured-system",
      :value => @record.hostname,
    }
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

  def textual_configuration_profile_desc
    h = {
      :label    => _("Configuration Profile Description"),
      :value    => @record.configuration_profile.try(:description),
      :explorer => true
    }
    h[:icon] = "fa fa-list-ul" if @record.configuration_profile
    h
  end

  def textual_provider_name
    {
      :label    => _("Provider"),
      :image    => @record.configuration_manager.decorate.fileicon,
      :value    => @record.configuration_manager.try(:name),
      :explorer => true
    }
  end

  def textual_zone
    {:label => _("Zone"), :value => @record.configuration_manager.my_zone}
  end

  def textual_group_environment
    TextualGroup.new(
      _("Environment"),
      %i[configuration_environment_name configuration_domain_name configuration_realm_name]
    )
  end

  def textual_configuration_environment_name
    {:label => _("Environment"), :value => @record.configuration_profile.try(:configuration_environment_name)}
  end

  def textual_configuration_domain_name
    {:label => _("Domain"), :value => @record.configuration_profile.try(:configuration_domain_name)}
  end

  def textual_configuration_realm_name
    {:label => _("Realm"), :value => @record.configuration_profile.try(:configuration_realm_name)}
  end

  def textual_group_os
    TextualGroup.new(
      _("Operating System"),
      %i[
        configuration_compute_profile_name configuration_architecture_name operating_system_flavor_name
        customization_script_medium_name customization_script_ptable_name
      ]
    )
  end

  def textual_configuration_compute_profile_name
    {:label => _("Compute Profile"), :value => @record.configuration_profile.try(:configuration_compute_profile_name)}
  end

  def textual_configuration_architecture_name
    {:label => _("Architecture"), :value => @record.configuration_profile.try(:configuration_architecture_name)}
  end

  def textual_operating_system_flavor_name
    {:label => _("OS Information"), :value => @record.configuration_profile.try(:operating_system_flavor_name)}
  end

  def textual_customization_script_medium_name
    {:label => _("Medium"), :value => @record.configuration_profile.try(:customization_script_medium_name)}
  end

  def textual_customization_script_ptable_name
    {:label => _("Partition Table"), :value => @record.configuration_profile.try(:customization_script_ptable_name)}
  end

  def textual_group_tenancy
    TextualGroup.new(_("Tenancy"), %i[configuration_locations_name configuration_organizations_name])
  end

  def textual_configuration_locations_name
    {
      :label => _("Configuration Location"),
      :value => (@record.configuration_profile.try(:configuration_locations) || []).collect(&:name).join(", ")
    }
  end

  def textual_configuration_organizations_name
    {
      :label => _("Configuration Organization"),
      :value => (@record.configuration_profile.try(:configuration_organizations) || []).collect(&:name).join(", ")
    }
  end

end
