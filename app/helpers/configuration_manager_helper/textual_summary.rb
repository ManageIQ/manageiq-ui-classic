module ConfigurationManagerHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  include TextualMixins::TextualZone

  def textual_group_properties
    %i[description hostname ipaddress type port guid region]
  end

  def textual_description
    return nil if @record.try(:description).blank?
    {:label => _("Description"), :value => @record.description}
  end

  def textual_region
    return nil if @record.provider_region.blank?
    label_val = _('Region')
    {:label => label_val, :value => @record.provider_region}
  end

  def textual_hostname
    @record.hostname
  end

  def textual_ipaddress
    return nil if @record.ipaddress.blank?
    {:label => _("Discovered IP Address"), :value => @record.ipaddress}
  end

  def textual_type
    {:label => _('Type'), :value => @record.emstype_description}
  end

  def textual_port
    @record.supports_port? ? {:label => _("API Port"), :value => @record.port} : nil
  end

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @record.guid}
  end

  def textual_group_relationships
    %i[configuration_profiles configured_systems]
  end

  def textual_configuration_profiles
    num   = @record.number_of(:configuration_profiles)
    h     = {:label => _('Configuration Profiles'), :icon => "pficon pficon-configuration_profile", :value => num}
    if num.positive? && role_allows?(:feature => "configuration_profile_show_list")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'configuration_profiles')
      h[:title] = _("Show all Configuration Profiles")
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

  def textual_group_status
    textual_authentications(@record.authentication_for_summary) + %i[refresh_status refresh_date]
  end

  def textual_group_tags
    %i[tags]
  end

end
