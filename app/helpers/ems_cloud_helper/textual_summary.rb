module EmsCloudHelper::TextualSummary
  include TextualMixins::TextualRefreshStatus
  include TextualMixins::TextualCustomButtonEvents
  include TextualMixins::TextualZone
  include TextualMixins::EmsCommon
  #
  # Groups
  #

  def textual_group_properties
    TextualGroup.new(
      _("Properties"),
      %i[description hostname ipaddress type port guid region keystone_v3_domain_id]
    )
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        ems_infra network_manager availability_zones host_aggregates cloud_tenants flavors
        security_groups placement_groups resource_pools instances images cloud_volumes orchestration_stacks storage_managers cloud_databases
        custom_button_events tenant
      ]
    )
  end

  def textual_group_status
    TextualGroup.new(_("Status"), textual_authentications(@record.authentication_for_summary) + %i[refresh_status refresh_date])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[zone tags])
  end

  #
  # Items
  #
  def textual_description
    return nil if @record.try(:description).blank?
    {:label => _("Description"), :value => @record.description}
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
    @record.ipaddress.present? ? {:label => _("Discovered IP Address"), :value => @record.ipaddress} : nil
  end

  def textual_type
    {:label => _('Type'), :value => @record.emstype_description}
  end

  def textual_port
    @record.port.present? ? {:label => _("API Port"), :value => @record.port} : nil
  end

  def textual_guid
    {:label => _("Management Engine GUID"), :value => @record.guid}
  end

  def textual_instances
    num   = @record.number_of(:vms)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "vm_show_list")
      h[:link]  = ems_cloud_path(@record.id, :display => 'instances')
      h[:title] = _("Show all Instances")
    end
    h
  end

  def textual_images
    num = @record.number_of(:miq_templates)
    h = {:label => _('Images'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num.positive? && role_allows?(:feature => "miq_template_show_list")
      h[:link] = ems_cloud_path(@record.id, :display => 'images')
      h[:title] = _("Show all Images")
    end
    h
  end

  def textual_cloud_volumes
    num = @record.number_of(:cloud_volumes)
    h = {:label => _('Cloud Volumes'), :icon => "pficon pficon-volume", :value => num}
    if num.positive? && role_allows?(:feature => "cloud_volume_show_list")
      h[:link] = ems_cloud_path(@record.id, :display => 'cloud_volumes')
      h[:title] = _("Show Cloud Volumes")
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
    num   = @record.try(:storage_managers) ? @record.number_of(:storage_managers) : 0
    h     = {:label => _('Storage Managers'), :icon => "fa fa-database", :value => num}
    if num.positive? && role_allows?(:feature => "ems_storage_show_list")
      h[:title] = _("Show all Storage Managers")
      h[:link] = ems_cloud_path(@record.id, :display => 'storage_managers')
    end
    h
  end

  def textual_placement_groups
    num   = @record.try(:placement_groups) ? @record.number_of(:placement_groups) : 0
    h     = {:label => _('Placement Groups'), :icon => "fa fa-database", :value => num}
    if num.positive?
      h[:title] = _("Show all Placement Groups")
      h[:link] = ems_cloud_path(@record.id, :display => 'placement_groups')
    end
    h
  end

  def textual_resource_pools
    num   = @record.try(:resource_pools) ? @record.number_of(:resource_pools) : 0
    h     = {:label => _('Resource Pools'), :icon => "pficon pficon-resource-pool", :value => num}
    if num.positive? && role_allows?(:feature => "resource_pool_cloud_show_list")
      h[:title] = _("Show all Resource Pools")
      h[:link] = ems_cloud_path(@record.id, :display => 'resource_pools_cloud')
    end
    h
  end

  def textual_cloud_databases
    num   = @record.try(:cloud_databases) ? @record.number_of(:cloud_databases) : 0
    h     = {:label => _('Cloud Databases'), :icon => "fa fa-database", :value => num}
    if num.positive? && role_allows?(:feature => "cloud_database_show_list")
      h[:title] = _("Show all Cloud Databases")
      h[:link] = ems_cloud_path(@record.id, :display => 'cloud_databases')
    end
    h
  end

  def textual_availability_zones
    textual_link(@record.availability_zones, :label => _('Availability Zones'))
  end

  def textual_host_aggregates
    textual_link(@record.host_aggregates, :label => _('Host Aggregates'))
  end

  def textual_cloud_tenants
    textual_link(@record.cloud_tenants, :label => _('Cloud Tenants'))
  end

  def textual_orchestration_stacks
    textual_link(@record.orchestration_stacks, :label => _('Orchestration Stacks'))
  end

  def textual_flavors
    textual_link(@record.flavors, :label => _('Flavors'))
  end

  def textual_security_groups
    num = @record.number_of(:security_groups)
    h = {:label => _('Security Groups'), :icon => "pficon pficon-cloud-security", :value => num}
    if num.positive? && role_allows?(:feature => "security_group_show_list")
      h[:link] = ems_cloud_path(@record.id, :display => 'security_groups')
      h[:title] = _("Show all Security Groups")
    end
    h
  end

  def textual_tenant
    return nil unless User.current_user.super_admin_user?

    {:label => _('Tenant'), :value => @record.tenant.name}
  end
end
