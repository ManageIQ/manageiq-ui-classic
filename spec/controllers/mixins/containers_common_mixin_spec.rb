def solo_run?
  RSpec.configuration.files_to_run == __FILE__ || RSpec.configuration.files_to_run == [__FILE__]
end

mixin_controllers = %w(
  container_build_controller
  container_controller
  container_group_controller
  container_image_controller
  container_image_registry_controller
  container_node_controller
  container_project_controller
  container_replicator_controller
  container_route_controller
  container_service_controller
  container_template_controller
  persistent_volume_controller
)

# Only run these specs if it ems_common is run by itself,
# for instance, from the command line or Guard.

if solo_run?
  explicit_run_specs = mixin_controllers.map do |s|
    ManageIQ::UI::Classic::Engine.root.join('spec', 'controllers', "#{s}_spec.rb").to_s
  end

  puts "Running all examples for #{explicit_run_specs.count} specs that include ContainersCommonMixin"

  RSpec::Core::Runner.run(explicit_run_specs)
end
