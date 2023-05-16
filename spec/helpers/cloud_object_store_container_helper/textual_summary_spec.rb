describe CloudObjectStoreContainerHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i[key size]
  include_examples "textual_group", "Relationships", %i[parent_ems_cloud ems cloud_tenant cloud_object_store_objects custom_button_events]
end
