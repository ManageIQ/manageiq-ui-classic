describe CloudDatabaseHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i(ems_cloud)
  include_examples "textual_group", "Properties", %i(name type status ems_ref)
end
