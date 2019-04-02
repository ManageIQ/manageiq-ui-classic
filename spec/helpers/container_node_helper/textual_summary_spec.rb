describe ContainerNodeHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i(
    ems
    container_routes
    container_services
    container_replicators
    container_groups
    containers
    lives_on
    container_images
    custom_button_events
  )
  include_examples "textual_group", "Properties", %i(
    name
    creation_timestamp
    resource_version
    num_cpu_cores
    memory
    max_container_groups
    identity_system
    identity_machine
    identity_infra
    container_runtime_version
    kubernetes_kubelet_version
    kubernetes_proxy_version
    os_distribution
    kernel_version
  )
  include_examples "textual_group_smart_management"
end
