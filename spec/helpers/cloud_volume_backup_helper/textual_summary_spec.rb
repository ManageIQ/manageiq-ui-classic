describe CloudVolumeBackupHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[parent_ems_cloud ems_storage cloud_volume cloud_tenant]
  include_examples "textual_group", "Properties", %i[name status size]
end
