describe PlacementGroupHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i(ems_cloud instances)
  include_examples "textual_group", "Properties", %i(name policy)
end
