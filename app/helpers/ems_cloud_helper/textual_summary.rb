module EmsCloudHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i(provider_region hostname ipaddress type port guid region keystone_v3_domain_id)
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i(
        ems_infra network_manager availability_zones host_aggregates cloud_tenants flavors
        security_groups instances images orchestration_stacks storage_managers
      )
    )
  end

  def textual_group_status
    TextualGroup.new(_("Status"), textual_authentications(@record.authentication_for_summary) + %i(refresh_status))
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i(zone tags))
  end

  def textual_group_topology
    items = %w(topology)
    i = items.collect { |m| send("textual_#{m}") }.flatten.compact
    TextualGroup.new(_("Overview"), i)
  end

  #
  # Items
  #
  def textual_provider_region
    return nil if @record.provider_region.nil?
    label_val = @record.type.include?("Google") ? _("Preferred Region") : _("Region")
    {:label => label_val, :value => @record.description}
  end

  def textual_region
    return nil if @record.provider_region.blank?
    label_val = _('Region')
    {:label => label_val, :value => @record.provider_region}
  end

  def textual_keystone_v3_domain_id
    return nil if !@record.respond_to?(:keystone_v3_domain_id) || @record.keystone_v3_domain_id.nil?
    label_val = _("Keystone V3 Domain ID")
    {:label => label_val, :value => @record.keystone_v3_domain_id}
  end

  def textual_hostname
    @record.hostname
  end

  def textual_ipaddress
    return nil if @record.ipaddress.blank?
    {:label => _("Discovered IP Address"), :value => @record.ipaddress}
  end

  def textual_type
    @record.emstype_description
  end

  def textual_port
    @record.supports_port? ? {:label => _("API Port"), :value => @record.port} : nil
  end

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @record.guid}
  end

  def textual_instances
    label = ui_lookup(:tables => "vm_cloud")
    num   = @record.number_of(:vms)
    h     = {:label => label, :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:link]  = ems_cloud_path(@record.id, :display => 'instances')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_images
    label = ui_lookup(:tables => "template_cloud")
    num = @record.number_of(:miq_templates)
    h = {:label => label, :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "miq_template_show_list")
      h[:link] = ems_cloud_path(@record.id, :display => 'images')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_ems_infra
    textual_link(@record.try(:provider).try(:infra_ems))
  end

  def textual_network_manager
    textual_link(@record.ext_management_system.try(:network_manager))
  end

  def textual_storage_managers
    label = _("Storage Managers")
    num   = @record.try(:storage_managers) ? @record.number_of(:storage_managers) : 0
    h     = {:label => label, :icon => "fa fa-database", :value => num}
    if num > 0 && role_allows?(:feature => "ems_storage_show_list")
      h[:title] = _("Show all %{label}") % {:label => label}
      h[:link] = ems_cloud_path(@record.id, :display => 'storage_managers')
    end
    h
  end

  def textual_availability_zones
    @record.availability_zones
  end

  def textual_host_aggregates
    @record.host_aggregates
  end

  def textual_cloud_tenants
    @record.cloud_tenants
  end

  def textual_orchestration_stacks
    @record.orchestration_stacks
  end

  def textual_flavors
    @record.flavors
  end

  def textual_security_groups
    label = ui_lookup(:tables => "security_group")
    num = @record.number_of(:security_groups)
    h = {:label => label, :icon => "pficon pficon-cloud-security", :value => num}
    if num > 0 && role_allows?(:feature => "security_group_show_list")
      h[:link] = ems_cloud_path(@record.id, :display => 'security_groups')
      h[:title] = _("Show all %{label}") % {:label => label}
    end
    h
  end

  def textual_zone
    {:label => _("Managed by Zone"), :icon => "pficon pficon-zone", :value => @record.zone.name}
  end

  def textual_topology
    {:label => _('Topology'),
     :icon  => "pficon pficon-topology",
     :link  => url_for_only_path(:controller => 'cloud_topology', :action => 'show', :id => @record.id),
     :title => _("Show topology")}
  end
end
