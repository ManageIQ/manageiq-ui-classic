describe "catalog/_sandt_tree_show.html.haml" do
  let(:admin_user) { FactoryBot.create(:user_admin) }
  let(:bundle)     { FactoryBot.create(:service_template, :service_type => "composite", :display => true, :tenant => tenant) }
  let(:tenant)     { FactoryBot.create(:tenant) }

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
    expect(rendered).to include(bundle.name)
    expect(rendered).to include(bundle.tenant.name)
  end
end
