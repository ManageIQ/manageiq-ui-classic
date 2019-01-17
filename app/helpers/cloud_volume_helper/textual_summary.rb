module CloudVolumeHelper::TextualSummary
  include TextualMixins::TextualDescription
  include TextualMixins::TextualGroupTags
  include TextualMixins::TextualName
  include TextualMixins::TextualCustomButtonEvents

  def textual_group_properties
    TextualGroup.new(_("Properties"), %i[name size bootable description status multiattach])
  end

  def textual_group_relationships
    TextualGroup.new(
      _("Relationships"),
      %i[
        parent_ems_cloud ems availability_zone cloud_tenant base_snapshot cloud_volume_backups
        cloud_volume_snapshots attachments custom_button_events
      ]
    )
  end

  def textual_size
    {:label => _("Size"), :value => number_to_human_size(@record.size, :precision => 2)}
  end

  def textual_bootable
    {:label => _('Bootable'), :value => @record.bootable.to_s}
  end

  def textual_status
    {:label => _('Status'), :value => @record.status.to_s}
  end

  def textual_multiattach
    @record.multi_attachment.to_s
  end

  def textual_parent_ems_cloud
    textual_link(@record.ext_management_system.try(:parent_manager), :label => _("Parent Cloud Provider"))
  end

  def textual_ems
    textual_link(@record.ext_management_system)
  end

  def textual_availability_zone
    availability_zone = @record.availability_zone
    h = {
      :label => _('Availability Zone'),
      :icon  => "pficon pficon-zone",
      :value => (availability_zone.nil? ? _("None") : availability_zone.name)
    }
    if availability_zone && role_allows?(:feature => "availability_zone_show")
      h[:title] = _("Show this Volume's Availability Zone")
      h[:link]  = url_for_only_path(:controller => 'availability_zone', :action => 'show', :id => availability_zone)
    end
    h
  end

  def textual_base_snapshot
    base_snapshot = @record.base_snapshot if @record.respond_to?(:base_snapshot)
    h = {
      :label => _('Base Snapshot'),
      :icon  => "fa fa-camera",
      :value => (base_snapshot.nil? ? _("None") : base_snapshot.name)
    }
    if base_snapshot && role_allows?(:feature => "cloud_volume_snapshot_show")
      h[:title] = _("Show this Volume's Base Snapshot")
      h[:link]  = url_for_only_path(:controller => 'cloud_volume_snapshot', :action => 'show', :id => base_snapshot)
    end
    h
  end

  def textual_cloud_tenant
    cloud_tenant = @record.cloud_tenant if @record.respond_to?(:cloud_tenant)
    h = {:label => _('Cloud Tenants'), :icon => "pficon pficon-cloud-tenant", :value => (cloud_tenant.nil? ? _("None") : cloud_tenant.name)}
    if cloud_tenant && role_allows?(:feature => "cloud_tenant_show")
      h[:title] = _("Show this Volume's Cloud Tenants")
      h[:link]  = url_for_only_path(:controller => 'cloud_tenant', :action => 'show', :id => cloud_tenant)
    end
    h
  end

  def textual_cloud_volume_snapshots
    num   = @record.number_of(:cloud_volume_snapshots)
    h     = {:label => _('Cloud Volume Snapshots'), :icon => "fa fa-camera", :value => num}
    if num > 0 && role_allows?(:feature => "cloud_volume_snapshot_show_list")
      h[:title] = _("Show all Cloud Volume Snapshots")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'cloud_volume_snapshots')
    end
    h
  end

  def textual_cloud_volume_backups
    num   = @record.number_of(:cloud_volume_backups)
    h     = {:label => _('Cloud Volume Backups'), :icon => "pficon pficon-volume", :value => num}
    if num > 0 && role_allows?(:feature => "cloud_volume_backup_show_list")
      h[:title] = _("Show all Cloud Volume Backups")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'cloud_volume_backups')
    end
    h
  end

  def textual_attachments
    num   = @record.number_of(:attachments)
    h     = {:label => _('Instances'), :icon => "pficon pficon-virtual-machine", :value => num}
    if num > 0 && role_allows?(:feature => "vm_show_list")
      h[:title] = _("Show all attached Instances")
      h[:link]  = url_for_only_path(:action => 'show', :id => @record, :display => 'instances')
    end
    h
  end
end
