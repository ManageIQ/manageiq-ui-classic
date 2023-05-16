describe CloudObjectStoreObjectHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i[key content_length last_modified etag]
  include_examples "textual_group", "Relationships", %i[parent_ems_cloud ems cloud_tenant cloud_object_store_container]
end
