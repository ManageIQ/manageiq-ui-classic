describe ContainerServiceHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[
    ems
    container_project
    container_routes
    container_groups
    container_nodes
    container_image_registry
  ]

  include_examples "textual_group", "Properties", %i[name creation_timestamp resource_version session_affinity service_type portal_ip]

  include_examples "textual_group_smart_management"
end
