describe EmsObjectStorageController do
  include_examples :shared_examples_for_ems_object_storage_controller, %w(openstack)

  describe '#show_list' do
    render_views

    it 'renders the view and the Object Storage Managers toolbar' do
      setup_zone
      stub_user :features => :all
      expect(ApplicationHelper::Toolbar::EmsObjectStoragesCenter).to receive(:definition).and_call_original
      post :show_list
    end
  end
end
