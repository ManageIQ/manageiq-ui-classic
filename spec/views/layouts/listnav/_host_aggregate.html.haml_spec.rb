describe "layouts/listnav/_host_aggregate.html.haml" do
  helper QuadiconHelper

  before do
    set_controller_for_view("host_aggregate")
    assign(:panels, "ems_prop" => true, "ems_rel" => true)
    allow(view).to receive(:truncate_length).and_return(15)
    allow(view).to receive(:role_allows?).and_return(true)
  end

  let(:provider) do
    allow_any_instance_of(User).to receive(:get_timezone).and_return(Time.zone)
    FactoryBot.create(:ems_openstack)
  end

  it "link to parent cloud provider uses restful path" do
    @record = FactoryBot.create(:host_aggregate_openstack, :ext_management_system => provider, :name => 'A test')
    render
    expect(response).to include("Show this Host Aggregate&#39;s parent Cloud Provider\" href=\"/ems_cloud/#{@record.ext_management_system.id}\">")
  end
end
