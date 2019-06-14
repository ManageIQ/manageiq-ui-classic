describe "catalog/_sandt_tree_show.html.haml" do
  let(:admin_user) { FactoryBot.create(:user_admin, :userid => 'admin') }
  let(:bundle) do
    FactoryBot.create(:service_template, :name         => 'My Bundle',
                                         :id           => 1,
                                         :service_type => "composite",
                                         :display      => true,
                                         :tenant       => tenant)
  end
  let(:tenant) { FactoryBot.create(:tenant) }

  before do
    set_controller_for_view("catalog")
    set_controller_for_view_to_be_nonrestful
    assign(:record, bundle)
    assign(:sb, {})
    assign(:tenants_tree, TreeBuilderTenants.new('tenants_tree', {}, true, :additional_tenants => [], :selectable => false))
    login_as admin_user
  end

  it "Renders bundle summary screen" do
    render
    expect(rendered).to include('My Bundle')
    expect(rendered).to include(bundle.tenant.name)
  end
end
