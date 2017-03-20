def solo_run?
  RSpec.configuration.files_to_run == __FILE__ || RSpec.configuration.files_to_run == [__FILE__]
end

mixin_controllers = %w(
  ems_block_storage_controller
  ems_cloud_controller
  ems_container_controller
  ems_datawarehouse_controller
  ems_infra_controller
  ems_middleware_controller
  ems_network_controller
  ems_object_storage_controller
  ems_physical_infra_controller
  ems_storage_controller
  middleware_datasource_controller
  middleware_deployment_controller
  middleware_domain_controller
  middleware_messaging_controller
  middleware_server_controller
  middleware_server_group_controller
)

# if solo_run?
#   puts "Running shared button examples for #{mixin_controllers.count} controllers that include EmsCommon"
# end
#
# mixin_controllers.map{|c| c.camelize.constantize }.each do |ctrlr|
#   describe ctrlr do
#     describe '#button' do
#       include_examples :ems_common_button_examples
#     end
#   end
# end

# Only run these specs if it ems_common is run by itself,
# for instance, from the command line or Guard.

if solo_run?
  explicit_run_specs = mixin_controllers.map do |s|
    ManageIQ::UI::Classic::Engine.root.join('spec', 'controllers', "#{s}_spec.rb").to_s
  end

  explicit_run_specs << ManageIQ::UI::Classic::Engine.root.join("spec/controllers/ems_common_controller_spec.rb").to_s

  puts "Running all examples for #{explicit_run_specs.count} specs that include EmsCommon"

  RSpec::Core::Runner.run(explicit_run_specs)
end
