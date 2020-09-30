module ConfigurationProfileHelper::TextualSummary
  def textual_configuration_profile_group_properties
    %i[configuration_profile_name
       configuration_profile_description
       configuration_profile_target_platform
       configuration_profile_region
       configuration_profile_zone]
  end

  def textual_configuration_profile_name
    h = {:label => _("Name"), :value => @record.name}
    if @record.supports_console?
      h[:link] = @record.console_url
      h[:title] = _("Go to Configuration Profile's console")
    end
    h
  end

  def textual_configuration_profile_description
    create_label('Description', 'description')
  end

  def textual_configuration_profile_target_platform
    create_label('Target Platform', 'target_platform')
  end

  def textual_configuration_profile_region
    create_label('Region', 'region_description')
  end

  def textual_configuration_profile_zone
    create_label('Zone', 'my_zone')
  end

  def textual_configuration_profile_group_environment
    %i[configuration_profile_environment
       configuration_profile_domain
       configuration_profile_puppet_realm]
  end

  def textual_configuration_profile_environment
    create_label('Environment', 'configuration_environment_name')
  end

  def textual_configuration_profile_domain
    create_label('Domain', 'configuration_domain_name')
  end

  def textual_configuration_profile_puppet_realm
    create_label('Puppet Realm', 'configuration_realm_name')
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
    create_label('Compute Profile', 'configuration_compute_profile_name')
  end

  def textual_configuration_profile_architecture
    create_label('Architecture', 'configuration_architecture_name')
  end

  def textual_configuration_profile_os
    create_label('OS', 'operating_system_flavor_name')
  end

  def textual_configuration_profile_medium
    create_label('Medium', 'customization_script_medium_name')
  end

  def textual_configuration_profile_partition_table
    create_label('Partition Table', 'customization_script_ptable_name')
  end

  def textual_configuration_profile_group_tenancy
    %i[configuration_profile_configuration_locations
       configuration_profile_configuration_organizations]
  end

  def textual_configuration_profile_configuration_locations
    return nil if @record.configuration_locations.empty?

    {
      :label => _("Configuration Location"),
      :value => @record.configuration_locations.collect(&:name).join(", ")
    }
  end

  def textual_configuration_profile_configuration_organizations
    return nil if @record.configuration_organizations.empty?

    {
      :label => _("Configuration Organization"),
      :value => @record.configuration_organizations.collect(&:name).join(", ")
    }
  end

  def create_label(name, property)
    value = @record.try(property)
    return nil if value.blank?

    {:label => _(name), :value => value}
  end
end
