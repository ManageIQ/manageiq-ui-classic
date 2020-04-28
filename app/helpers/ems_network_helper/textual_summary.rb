module EmsNetworkHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  include TextualMixins::TextualCustomButtonEvents
  include TextualMixins::TextualZone
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[provider_region hostname ipaddress type port guid])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        parent_ems_cloud cloud_tenants cloud_networks cloud_subnets network_routers security_groups
        security_policies floating_ips network_ports network_services custom_button_events
      ]
    )
  end

  def textual_group_status
    TextualGroup.new(_("Status"), textual_authentications(@record.authentication_for_summary) + %i[refresh_status refresh_date])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[zone tags])
  end

  def textual_group_topology
    items = %w[topology]
    i = items.collect { |m| send("textual_#{m}") }.flatten.compact

    TextualGroup.new(_("Overview"), i)
  end

  #
  # Items
  #
  def textual_provider_region
    return nil if @record.provider_region.nil?
    {:label => _("Region"), :value => @record.description}
  end

  def textual_hostname
    @record.hostname
  end

  def textual_ipaddress
    return nil if @record.ipaddress.blank?
    {:label => _("Discovered IP Address"), :value => @record.ipaddress}
  end

  def textual_type
    {:label => _("Type"), :value => @record.emstype_description}
  end

  def textual_port
    @record.supports_port? ? {:label => _("API Port"), :value => @record.port} : nil
  end

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @record.guid}
  end

  def textual_parent_ems_cloud
    textual_link(@record.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_security_groups
    textual_link(@record.security_groups, :label => _("Security Groups"))
  end

  def textual_security_policies
    textual_link(@record.security_policies, :label => _("Security Policies"))
  end

  def textual_floating_ips
    textual_link(@record.floating_ips, :label => _("Floating IPs"))
  end

  def textual_network_routers
    textual_link(@record.network_routers, :label => _("Network Routers"))
  end

  def textual_network_ports
    textual_link(@record.network_ports, :label => _("Network Ports"))
  end

  def textual_network_services
    textual_link(@record.network_services, :label => _("Network Services"))
  end

  def textual_cloud_networks
    textual_link(@record.cloud_networks, :label => _("Cloud Networks"))
  end

  def textual_cloud_subnets
    textual_link(@record.cloud_subnets, :label => _("Cloud Subnets"))
  end

  def textual_topology
    {:label => _('Topology'),
     :icon  => "pficon pficon-topology",
     :link  => url_for_only_path(:controller => 'network_topology', :action => 'show', :id => @record.id),
     :title => _("Show topology")}
  end

  def textual_cloud_tenants
    textual_link(
      @record.try(:cloud_tenants),
      :label => _('Cloud Tenants'),
      :link  => url_for_only_path(:display => 'cloud_tenants')
    )
  end
end
