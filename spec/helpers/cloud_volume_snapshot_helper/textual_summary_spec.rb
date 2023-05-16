describe CloudVolumeSnapshotHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[parent_ems_cloud ems cloud_volume based_volumes cloud_tenant]
  include_examples "textual_group", "Properties", %i[name size description]
end
