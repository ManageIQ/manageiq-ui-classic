describe CloudVolumeHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i(
    parent_ems_cloud
    ems
    availability_zone
    cloud_tenant
    base_snapshot
    cloud_volume_backups
    cloud_volume_snapshots
    attachments
    custom_button_events
  )
  include_examples "textual_group", "Properties", %i(name size bootable description status multiattach)
end
