describe ResourcePoolHelper::TextualSummary do
  include_examples "textual_group", "Properties", %i(
    vapp
    aggregate_cpu_speed
    aggregate_cpu_memory
    aggregate_physical_cpus
    aggregate_cpu_total_cores
    aggregate_vm_memory
    aggregate_vm_cpus
  )

  include_examples "textual_group", "Relationships", %i(
    parent_datacenter
    parent_cluster
    parent_host
    direct_vms
    allvms_size
    resource_pools
  )

  include_examples "textual_group", "Configuration", %i(
    memory_reserve
    memory_reserve_expand
    memory_limit
    memory_shares
    memory_shares_level
    cpu_reserve
    cpu_reserve_expand
    cpu_limit
    cpu_shares
    cpu_shares_level
  )

  include_examples "textual_group_smart_management"
end
