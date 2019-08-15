describe 'catalog/_form_basic_info.html.haml' do
  before { set_controller_for_view('catalog') }

  context 'Additional Tenants tree' do
    let(:user) { FactoryBot.create(:user_admin, :userid => 'admin') }

    before do
      allow(view).to receive(:hidden_div_if)
      assign(:edit, :new => {:available_dialogs => {}})
      assign(:available_catalogs, [])
      assign(:zones, [])
      assign(:tenants_tree, TreeBuilderTenants.new('tenants_tree', {}, true, :additional_tenants => [], :selectable => true))
      login_as user
    end

    it 'renders Additional Tenants field with tree' do
      render :partial => 'catalog/form_basic_info'
      expect(response).to include('Additional Tenants')
    end

    context 'user does not have permission to see Tenants' do
      let(:user) { FactoryBot.create(:user_with_group) }

      it 'does not render Additional Tenants field with tree' do
        render :partial => 'catalog/form_basic_info'
        expect(response).not_to include('Additional Tenants')
      end
    end
  end
end
