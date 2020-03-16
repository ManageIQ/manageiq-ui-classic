module ConfigurationProfileHelper::TextualSummary
  def textual_configuration_profile_group_properties
    %i[configuration_profile_name
       configuration_profile_region
       configuration_profile_zone]
  end

  def textual_configuration_profile_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_configuration_profile_region
    {:label => _("Region"), :value => @record.region_description}
  end

  def textual_configuration_profile_zone
    {:label => _("Zone"), :value => @record.my_zone}
  end

  def textual_configuration_profile_group_environment
    %i[configuration_profile_environment
       configuration_profile_domain
       configuration_profile_puppet_realm]
  end

  def textual_configuration_profile_environment
    {:label => _("Environment"), :value => @record.configuration_environment_name}
  end

  def textual_configuration_profile_domain
    {:label => _("Domain"), :value => @record.configuration_domain_name}
  end

  def textual_configuration_profile_puppet_realm
    {:label => _("Puppet Realm"), :value => @record.configuration_realm_name}
  end

  def textual_configuration_profile_group_os
    %i[configuration_profile_compute_profile
       configuration_profile_architecture
       configuration_profile_os
       configuration_profile_medium
       configuration_profile_partition_table]
  end

  def textual_configuration_profile_compute_profile
    {:label => _("Compute Profile"), :value => @record.configuration_compute_profile_name}
  end

  def textual_configuration_profile_architecture
    {:label => _("Architecture"), :value => @record.configuration_architecture_name}
  end

  def textual_configuration_profile_os
    {:label => _("OS"), :value => @record.operating_system_flavor_name}
  end

  def textual_configuration_profile_medium
    {:label => _("Medium"), :value => @record.customization_script_medium_name}
  end

  def textual_configuration_profile_partition_table
    {:label => _("Partition Table"), :value => @record.customization_script_ptable_name}
  end

  def textual_configuration_profile_group_tenancy
    %i[configuration_profile_configuration_locations
       configuration_profile_configuration_organizations]
  end

  def textual_configuration_profile_configuration_locations
    {
      :label => _("Configuration Location"),
      :value => @record.configuration_locations.collect(&:name).join(", ")
    }
  end

  def textual_configuration_profile_configuration_organizations
    {
      :label => _("Configuration Organization"),
      :value => @record.configuration_organizations.collect(&:name).join(", ")
    }
  end
end
