describe NetworkPortController do
  include_examples :shared_examples_for_network_port_controller, %w[openstack azure google amazon]
end
