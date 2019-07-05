describe EmsNetworkController do
  include_examples :shared_examples_for_ems_network_controller, %w(openstack azure google amazon)

  it_behaves_like "controller with custom buttons"
  %w(cloud_tenants cloud_networks cloud_subnets network_routers security_groups).each do |custom_button_class|
    include_examples "relationship table screen with custom buttons", custom_button_class
  end
end
