describe ContainerImageRegistryHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[ems container_services container_groups container_images containers]
  include_examples "textual_group", "Properties", %i[host port]
  include_examples "textual_group_smart_management"
end
