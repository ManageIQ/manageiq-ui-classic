describe ContainerRouteHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[ems container_project container_service container_groups container_nodes]
  include_examples "textual_group", "Properties", %i[name creation_timestamp resource_version host_name path]
  include_examples "textual_group_smart_management"
end
