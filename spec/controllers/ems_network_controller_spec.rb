describe EmsNetworkController do
  include_examples :shared_examples_for_ems_network_controller, %w(openstack azure google amazon)

  it_behaves_like "controller with custom buttons"
end
