describe EmsStorageController do
  include_examples :shared_examples_for_ems_storage_controller, %w(openstack)

  it_behaves_like "controller with custom buttons"

  describe "#check_generic_rbac" do
    let(:feature)        { MiqProductFeature.find_all_by_identifier(%w(ems_block_storage_show ems_block_storage_show_list)) }
    let(:role)           { FactoryGirl.create(:miq_user_role, :miq_product_features => feature) }
    let(:group)          { FactoryGirl.create(:miq_group, :miq_user_role => role) }
    let(:user)           { FactoryGirl.create(:user, :miq_groups => [group]) }
    let(:object_storage) { FactoryGirl.create(:ems_swift) }
    let(:block_storage)  { FactoryGirl.create(:ems_cinder) }

    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      EvmSpecHelper.seed_specific_product_features(%w(ems_block_storage_show ems_block_storage_show_list))

      allow(User).to receive(:current_user).and_return(user)
      allow(Rbac).to receive(:role_allows?).and_call_original
      login_as user
    end

    it "allows access for block_storage" do
      controller.action_name = 'show'
      controller.instance_variable_set(:@record, block_storage)
      expect(controller.send(:type_feature_role_check)).to be_truthy
    end

    it "denies access for object_storage" do
      controller.action_name = 'show'
      allow(controller).to receive(:redirect_to)
      controller.instance_variable_set(:@record, object_storage)
      expect(controller.send(:type_feature_role_check)).to be_falsey
    end

    it "sets @ems in init_show for a selected record" do
      controller.action_name = 'show'
      ems_storage = FactoryGirl.create(:ems_storage, :name => "foo")
      allow(controller).to receive(:type_feature_role_check).and_return(true)
      controller.instance_variable_set(:@_params, :id => ems_storage.id)
      controller.send(:init_show)
      expect(assigns(:record).id).to eq(ems_storage.id)
      expect(assigns(:ems).id).to eq(ems_storage.id)
    end
  end
end
