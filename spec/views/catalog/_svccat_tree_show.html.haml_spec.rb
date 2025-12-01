describe "catalog/_svccat_tree_show.html.haml" do
  let(:service) { FactoryBot.create(:service_template) }

  before do
    assign(:record, service)
    assign(:sb, {})
  end

  it 'enables Order button' do
    render :partial => 'catalog/svccat_tree_show'
    expect(response.body).to include("\"action\":{\"remote\":true,\"url\":\"/catalog/x_button/#{service.id}?pressed=svc_catalog_provision\"}")
  end
end
