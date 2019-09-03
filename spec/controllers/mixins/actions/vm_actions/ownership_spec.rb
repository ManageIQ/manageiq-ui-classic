describe Mixins::Actions::VmActions::Ownership do
  describe '#build_ownership_info' do
    context 'setting ownership of Catalog Item' do
      let(:user_role) { FactoryBot.create(:miq_user_role) }
      let(:group) { FactoryBot.create(:miq_group, :miq_user_role => user_role) }
      let(:user) { FactoryBot.create(:user, :miq_groups => [group]) }
      let(:controller) { CatalogController.new }
      let(:cat_item) { FactoryBot.create(:service_template) }

      before do
        EvmSpecHelper.local_miq_server
        login_as user
        allow(controller).to receive(:find_records_with_rbac).and_return([cat_item])
        allow(MiqGroup).to receive(:non_tenant_groups).and_return([group])
        allow(controller).to receive(:session).and_return(:userid => user.userid)
        controller.params = {:controller => 'catalog'}
      end

      it 'makes quadicons in Affected Items section not clickable' do
        controller.send(:build_ownership_info, [cat_item.id])
        expect(controller.instance_variable_get(:@report_data_additional_options)[:clickable]).to be(false)
      end
    end
  end
end
