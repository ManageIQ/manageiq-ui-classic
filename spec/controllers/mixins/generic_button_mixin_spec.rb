# Only run this spec file if it is run by itself,
# for instance, from the command line or Guard.

if RSpec.configuration.files_to_run == __FILE__ || RSpec.configuration.files_to_run == [__FILE__]
  mixin_controllers = %w(
    auth_key_pair_cloud_controller_spec.rb
    availability_zone_controller_spec.rb
    cloud_network_controller_spec.rb
    cloud_object_store_container_controller_spec.rb
    cloud_object_store_object_controller_spec.rb
    cloud_subnet_controller_spec.rb
    cloud_tenant_controller_spec.rb
    cloud_volume_controller_spec.rb
    configuration_controller_spec.rb
    configuration_job_controller_spec.rb
    floating_ip_controller_spec.rb
    host_aggregate_controller_spec.rb
    host_controller_spec.rb
    infra_network_controller_spec.rb
    miq_ae_tools_controller_spec.rb
    miq_policy_controller_spec.rb
    miq_request_controller_spec.rb
    network_router_controller_spec.rb
    orchestration_stack_controller_spec.rb
    resource_pool_controller_spec.rb
    security_group_controller_spec.rb
    storage_controller_spec.rb
    storage_manager_controller_spec.rb
    vm_common_spec.rb
    ems_common_controller_spec.rb
    ems_cluster_controller_spec.rb
    ems_infra_controller_spec.rb
  ).map! { |s| ManageIQ::UI::Classic::Engine.root.join('spec', 'controllers', s).to_s }

  RSpec::Core::Runner.run(mixin_controllers)
end
