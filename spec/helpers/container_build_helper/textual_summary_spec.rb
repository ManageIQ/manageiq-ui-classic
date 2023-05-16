describe ContainerBuildHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[ems container_project]
  include_examples "textual_group", "Properties", %i[name creation_timestamp resource_version]
  include_examples "textual_group_smart_management"
end
