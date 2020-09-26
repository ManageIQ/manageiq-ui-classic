module EmsStorageHelper::TextualSummary
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
    relationships = %i[
                       parent_ems_cloud cloud_volumes cloud_volume_snapshots cloud_volume_backups
                       cloud_object_store_containers custom_button_events
      ]
    relationships.push(:cloud_volume_types) if @record.kind_of?(ManageIQ::Providers::StorageManager::CinderManager)
    TextualGroup.new(_("Relationships"), relationships)
  end

  def textual_group_status
    TextualGroup.new(_("Status"), textual_authentications(@record.authentication_for_summary) + %i[refresh_status refresh_date])
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[zone tags])
  end

  def textual_group_topology
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
    {:label => _('Type'), :value => @record.emstype_description}
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

  def textual_cloud_volumes
    textual_link(@record.try(:cloud_volumes), :label => _('Cloud Volumes'))
  end

  def textual_cloud_volume_snapshots
    textual_link(@record.try(:cloud_volume_snapshots), :label => _('Cloud Volume Snapshots'))
  end

  def textual_cloud_volume_backups
    textual_link(@record.try(:cloud_volume_backups), :label => _('Cloud Volume Backups'))
  end

  def textual_cloud_object_store_containers
    @record.try(:cloud_object_store_containers)
  end

  def textual_cloud_volume_types
    textual_link(@record.try(:cloud_volume_types), :label => _('Cloud Volume Types'))
  end

  def textual_storage_resources
    textual_link(@record.try(:storage_resources), :label => _('Storage Resources (Pools)'))
  end
end
