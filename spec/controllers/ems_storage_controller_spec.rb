describe EmsStorageController do
  include_examples :shared_examples_for_ems_storage_controller, %w(openstack)

  it_behaves_like "controller with custom buttons"

  describe "#check_generic_rbac" do
    let(:feature)        { MiqProductFeature.find_all_by_identifier(%w(ems_storage_show ems_storage_show_list)) }
    let(:role)           { FactoryBot.create(:miq_user_role, :miq_product_features => feature) }
    let(:group)          { FactoryBot.create(:miq_group, :miq_user_role => role) }
    let(:user)           { FactoryBot.create(:user, :miq_groups => [group]) }
    let(:storage)        { FactoryBot.create(:ems_swift) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      EvmSpecHelper.seed_specific_product_features(%w(ems_storage_show ems_storage_show_list))
      login_as user
    end

    it "allows access for block_storage" do
      controller.action_name = 'show'
      controller.instance_variable_set(:@record, storage)
      expect(controller.send(:type_feature_role_check)).to be_truthy
    end

    it "sets @ems in init_show for a selected record" do
      controller.action_name = 'show'
      ems_storage = FactoryBot.create(:ems_storage)
      allow(controller).to receive(:type_feature_role_check).and_return(true)
      controller.params = {:id => ems_storage.id}
      controller.send(:init_show)
      expect(assigns(:record).id).to eq(ems_storage.id)
      expect(assigns(:ems).id).to eq(ems_storage.id)
    end
  end

  describe '#button' do
    context 'tagging Cloud Object Store Container' do
      before do
        controller.params = {:pressed => 'cloud_object_store_container_tag'}
        controller.instance_variable_set(:@display, 'cloud_object_store_containers')
      end

      it 'returns proper record class' do
        expect(controller.send(:record_class)).to eq(CloudObjectStoreContainer)
      end
    end
  end

  describe '#show_list' do
    render_views

    it 'renders the view and the Block Storage Managers toolbar' do
      setup_zone
      login_as FactoryBot.create(:user, :features => "everything")
      expect(ApplicationHelper::Toolbar::EmsStoragesCenter).to receive(:definition).and_call_original
      post :show_list
    end
  end
end
