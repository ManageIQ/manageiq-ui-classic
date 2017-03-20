describe EmsStorageController do
  include_examples :shared_examples_for_ems_storage_controller, %w(openstack)

  it_behaves_like "controller with custom buttons"

  describe '#button' do
    include_examples :ems_common_button_examples
  end
end
