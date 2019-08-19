describe "catalog/_sandt_tree_show.html.haml" do
  let(:user)   { FactoryBot.create(:user_admin) }
  let(:bundle) { FactoryBot.create(:service_template, :service_type => "composite", :display => true, :tenant => tenant) }
  let(:tenant) { FactoryBot.create(:tenant) }

  before do
    set_controller_for_view("catalog")
    set_controller_for_view_to_be_nonrestful
    assign(:record, bundle)
    assign(:sb, {})
    assign(:tenants_tree, TreeBuilderTenants.new('tenants_tree', {}, true, :additional_tenants => [], :selectable => false))
    login_as user
  end

  it "Renders bundle summary screen" do
    render
    expect(rendered).to include(bundle.name)
    expect(rendered).to include(bundle.tenant.name)
  end

  context 'Additional Tenants' do
    it 'renders Additional Tenants field with tree' do
      render :partial => 'catalog/sandt_tree_show'
      expect(response).to include('Additional Tenants')
    end

    context 'user does not have permission to see Tenants' do
      let(:user) { FactoryBot.create(:user_with_group) }

      it 'does not render Additional Tenants field with tree' do
        render :partial => 'catalog/sandt_tree_show'
        expect(response).not_to include('Additional Tenants')
      end
    end
  end
end
