describe EmsBlockStorageController do
  include_examples :shared_examples_for_ems_block_storage_controller, %w(openstack)

  describe "#check_generic_rbac" do
    let(:feature) { %w(cloud_subnet_new) }
    let(:user)    { FactoryBot.create(:user, :features => feature) }

    before do
      setup_zone
      EvmSpecHelper.seed_specific_product_features(%w(cloud_subnet_new ems_block_storage_show_list))
      login_as user
    end

    it "denies access because user don't have needed role feature" do ##
      controller.action_name = 'report_data'
      expect(controller.send(:check_generic_rbac)).to be_falsey
    end

    context 'user has needed role feature' do
      let(:feature) { %w(ems_block_storage_show_list) }

      it "allows access" do ##
        controller.action_name = 'report_data'
        expect(controller.send(:check_generic_rbac)).to be_truthy
      end
    end
  end

  describe '#show_list' do
    render_views

    it 'renders the view and the Block Storage Managers toolbar' do
      setup_zone
      login_as FactoryBot.create(:user, :features => "everything")
      expect(ApplicationHelper::Toolbar::EmsBlockStoragesCenter).to receive(:definition).and_call_original
      post :show_list
    end
  end
end
