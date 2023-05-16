describe ContainerImageHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[
    ems
    container_image_registry
    container_projects
    container_groups
    containers
    container_nodes
    custom_button_events
  ]
  include_examples "textual_group", "Properties", %i[
    name
    tag
    id
    full_name
    os_distribution
    product_type
    product_name
    architecture
    author
    command
    entrypoint
    docker_version
    exposed_ports
    size
  ]
  include_examples "textual_group_smart_management"
  include_examples "textual_group", "Configuration", %i[guest_applications openscap openscap_html last_scan]
  include_examples "textual_group", "OpenSCAP Failed Rules Summary", %i[
    openscap_failed_rules_low
    openscap_failed_rules_medium
    openscap_failed_rules_high
  ], "openscap_failed_rules"
end
