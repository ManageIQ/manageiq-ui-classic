describe CloudVolumeTypeHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[parent_ems_cloud ems_storage]
  include_examples "textual_group", "Properties", %i[name description backend_name]
end
