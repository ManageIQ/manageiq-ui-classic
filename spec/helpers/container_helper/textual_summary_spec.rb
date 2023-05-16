describe ContainerHelper::TextualSummary do
  include_examples "textual_group", "Relationships", %i[
    ems
    container_project
    container_replicator
    container_group
    container_node
    container_image
  ]
  include_examples "textual_group", "Properties", %i[
    name
    state
    reason
    started_at
    finished_at
    exit_code
    signal
    message
    last_state
    restart_count
    backing_ref
    command
    capabilities_add
    capabilities_drop
    privileged
    run_as_user
    se_linux_user
    se_linux_role
    se_linux_type
    se_linux_level
    run_as_non_root
  ]
  include_examples "textual_group_smart_management"
end
