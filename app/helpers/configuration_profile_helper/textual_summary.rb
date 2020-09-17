module ConfigurationProfileHelper::TextualSummary
  def textual_configuration_profile_group_properties
    %i[configuration_profile_name
       configuration_profile_description
       configuration_profile_target_platform
       configuration_profile_region
       configuration_profile_zone]
  end

  def textual_configuration_profile_name
    {:label => _("Name"), :value => @record.name}
  end

  def textual_configuration_profile_description
    return nil if @record.description.blank?

    {:label => _("Description"), :value => @record.description}
  end

  def textual_configuration_profile_target_platform
    return nil if @record.target_platform.blank?

    {:label => _("Target Platform"), :value => @record.target_platform}
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

  def textual_configuration_profile_group_relationships
    %i[configuration_manager
       configured_systems]
  end

  def textual_configuration_manager
    configuration_manager = @record.configuration_manager
    h = {:label => "Configuration Manager", :icon => "pficon pficon-configuration_manager", :value => (configuration_manager.nil? ? _("None") : configuration_manager.name)}
    if configuration_manager && role_allows?(:feature => "ems_configuration_show")
      h[:title] = _("Show this Configuration Profile's Configuration Manager")
      h[:link]  = url_for_only_path(:controller => 'ems_configuration', :action => 'show', :id => configuration_manager)
    end
    h
  end

  def textual_configured_systems
    num   = @record.number_of(:configured_systems)
    h     = {:label => _('Configured Systems'), :icon => "pficon pficon-configured_system", :value => num}
    if num.positive? && role_allows?(:feature => "configured_system_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'configured_systems')
      h[:title] = _("Show all Configured Systems")
    end
    h
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
