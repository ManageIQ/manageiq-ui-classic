describe ContainerProjectHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[
    ems
    container_routes
    container_services
    container_replicators
    container_groups
    container_nodes
    container_images
    container_templates
    custom_button_events
  ]
  include_examples "textual_group", "Properties", %i[name display_name creation_timestamp resource_version]
  include_examples "textual_group_smart_management"
end
