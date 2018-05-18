describe EmsObjectStorageController do
  include_examples :shared_examples_for_ems_object_storage_controller, %w(openstack)

  describe '#show_list' do
    render_views

    it 'renders the Object Storage Managers Toolbar' do
      expect(ApplicationHelper::Toolbar::GtlView).to receive(:definition)
      post :show_list
    end
  end
end
