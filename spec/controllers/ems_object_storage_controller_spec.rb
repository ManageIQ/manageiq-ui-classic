describe EmsObjectStorageController do
  include_examples :shared_examples_for_ems_object_storage_controller, %w(openstack)

  describe '#button' do
    include_examples :ems_common_button_examples
  end
end
