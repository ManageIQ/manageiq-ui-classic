describe "catalog/_sandt_tree_show.html.haml" do
  before do
    set_controller_for_view("catalog")
    set_controller_for_view_to_be_nonrestful
    bundle = FactoryBot.create(:service_template,
                                :name         => 'My Bundle',
                                :id           => 1,
                                :service_type => "composite",
                                :display      => true)
    assign(:record, bundle)
    assign(:sb, {})
    assign(:tenants_tree, TreeBuilderTenants.new('tenants_tree', {}, true, :additional_tenants => [], :selectable => false))
  end

  it "Renders bundle summary screen" do
    render
    expect(rendered).to include('My Bundle')
  end
end
