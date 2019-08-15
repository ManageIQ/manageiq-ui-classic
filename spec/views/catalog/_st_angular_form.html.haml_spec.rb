describe "catalog/_st_angular_form.html.haml" do
  before { set_controller_for_view('catalog') }

  context 'Additional Tenants' do
    let(:user) { FactoryBot.create(:user_admin, :userid => 'admin') }

    before do
      allow(view).to receive(:playbook_label)
      assign(:edit, :new => {})
      assign(:record, FactoryBot.create(:service_template))
      assign(:tenants_tree, TreeBuilderTenants.new('tenants_tree', {}, true, :additional_tenants => [], :selectable => true))
      login_as user
    end

    it 'renders Additional Tenants field with tree' do
      render :partial => 'catalog/st_angular_form'
      expect(response).to include('Additional Tenants')
    end

    context 'user does not have permission to see Tenants' do
      let(:user) { FactoryBot.create(:user_with_group) }

      it 'does not render Additional Tenants field with tree' do
        render :partial => 'catalog/st_angular_form'
        expect(response).not_to include('Additional Tenants')
      end
    end
  end
end
