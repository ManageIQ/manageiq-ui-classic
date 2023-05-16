describe ContainerGroupHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[
    ems
    container_project
    container_services
    container_replicator
    containers
    container_node
    lives_on
    container_images
    persistent_volumes
    custom_button_events
  ]

  include_examples "textual_group", "Properties", %i[
    name
    status
    message
    reason
    creation_timestamp
    resource_version
    restart_policy
    dns_policy
    ip
  ]

  include_examples "textual_group_smart_management"

  include_examples "textual_group", "Container Statuses Summary", %i[waiting running terminated], "container_statuses_summary"
end
