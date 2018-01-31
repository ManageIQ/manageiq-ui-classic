describe EmsBlockStorageController do
  include_examples :shared_examples_for_ems_block_storage_controller, %w(openstack)

  describe "#check_generic_rbac" do
    let(:feature) { MiqProductFeature.find_all_by_identifier(%w(cloud_subnet_new)) }
    let(:role)    { FactoryGirl.create(:miq_user_role, :miq_product_features => feature) }
    let(:group)   { FactoryGirl.create(:miq_group, :miq_user_role => role) }
    let(:user)    { FactoryGirl.create(:user, :miq_groups => [group]) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      EvmSpecHelper.seed_specific_product_features(%w(cloud_subnet_new ems_block_storage_show_list))

      allow(User).to receive(:current_user).and_return(user)
      allow(Rbac).to receive(:role_allows?).and_call_original
      login_as user
    end

    it "denies access because user don't have needed role feature" do
      controller.action_name = 'report_data'
      expect(controller.send(:check_generic_rbac)).to be_falsey
    end

    context 'user has needed role feature' do
      let(:feature) { MiqProductFeature.find_all_by_identifier(%w(ems_block_storage_show_list)) }

      it "allows access" do
        controller.action_name = 'report_data'
        expect(controller.send(:check_generic_rbac)).to be_truthy
      end
    end
  end
end
