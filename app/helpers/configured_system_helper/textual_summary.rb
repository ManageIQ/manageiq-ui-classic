module ConfiguredSystemHelper::TextualSummary
  include TextualMixins::TextualGroupTags

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[hostname ipmi_present ipaddress mac_address vendor zone]
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
    create_label("IPMI Present", "", "ipmi_present")
  end

  def textual_ipaddress
    create_label("IP Address", "", "ipaddress")
  end

  def textual_mac_address
    create_label("Mac address", "", "mac_address")
  end

  def textual_vendor
    return nil if @record.vendor.blank?

    {:label => _("Vendor"), :value => @record.vendor}
  end

  def textual_zone
    create_label("Zone", "configuration_manager", "my_zone")
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[configuration_manager configuration_profile counterpart]
    )
  end

  def textual_configuration_manager
    configuration_manager = @record.configuration_manager
    h = {:label => "Configuration Manager", :icon => "pficon pficon-configuration_manager", :value => (configuration_manager.nil? ? _("None") : configuration_manager.name)}
    if configuration_manager && role_allows?(:feature => "ems_configuration_show")
      h[:title] = _("Show this Configured System's Configuration Manager")
      h[:link]  = url_for_only_path(:controller => 'ems_configuration', :action => 'show', :id => configuration_manager)
    end
    h
  end

  def textual_configuration_profile
    configuration_profile = @record.configuration_profile
    h = {:label => "Configuration Profile", :icon => "pficon pficon-configuration_profile", :value => (configuration_profile.nil? ? _("None") : configuration_profile.name)}
    if configuration_profile && role_allows?(:feature => "configuration_profile_show")
      h[:title] = _("Show this Configured System's Configuration Profile")
      h[:link]  = url_for_only_path(:controller => 'configuration_profile', :action => 'show', :id => configuration_profile)
    end
    h
  end

  def textual_counterpart
    counterpart_ems = @record.counterpart.try(:ext_management_system)
    return nil if counterpart_ems.nil?

    counterpart_entity_name = counterpart_ems.kind_of?(EmsCloud) ? _("Instance") : _("Virtual Machine")
    {
      :label => counterpart_entity_name,
      :image => counterpart_ems.decorate.fileicon,
      :value => @record.counterpart.name.to_s,
      :link  => url_for_only_path(
        :action     => 'show',
        :controller => 'vm_or_template',
        :id         => @record.counterpart.id
      )
    }
  end

  def textual_group_environment
    TextualGroup.new(
      _("Environment"),
      %i[configuration_environment_name configuration_domain_name configuration_realm_name]
    )
  end

  def textual_configuration_environment_name
    create_label("Environment", "configuration_profile", "configuration_environment_name")
  end

  def textual_configuration_domain_name
    create_label("Domain", "configuration_profile", "configuration_domain_name")
  end

  def textual_configuration_realm_name
    create_label("Realm", "configuration_profile", "configuration_realm_name")
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
    create_label("Compute Profile", "configuration_profile", "configuration_compute_profile_name")
  end

  def textual_configuration_architecture_name
    create_label("Architecture", "configuration_profile", "configuration_architecture_name")
  end

  def textual_operating_system_flavor_name
    create_label("OS Information", "configuration_profile", "operating_system_flavor_name")
  end

  def textual_customization_script_medium_name
    create_label("Medium", "configuration_profile", "customization_script_medium_name")
  end

  def textual_customization_script_ptable_name
    create_label("Partition Table", "configuration_profile", "customization_script_ptable_name")
  end

  def textual_group_tenancy
    TextualGroup.new(_("Tenancy"), %i[configuration_locations_name configuration_organizations_name])
  end

  def textual_configuration_locations_name
    return nil if @record.configuration_profile.try(:configuration_locations).blank?

    {
      :label => _("Configuration Location"),
      :value => (@record.configuration_profile.try(:configuration_locations) || []).collect(&:name).join(", ")
    }
  end

  def textual_configuration_organizations_name
    return nil if @record.configuration_profile.try(:configuration_organizations).blank?

    {
      :label => _("Configuration Organization"),
      :value => (@record.configuration_profile.try(:configuration_organizations) || []).collect(&:name).join(", ")
    }
  end

  def create_label(name, relatedObject, property)
    value = (relatedObject.blank?)? @record.try(property) : @record.try(relatedObject).try(property)
    return nil if value.blank?

    {:label => _(name), :value => value}
  end
end
