describe "catalog/_svccat_tree_show.html.haml" do
  let(:service) { FactoryBot.create(:service_template) }

  before do
    assign(:record, service)
    assign(:sb, {})
  end

  it 'enables Order button' do
    render :partial => 'catalog/svccat_tree_show'
    expect(response).to include("miqOrderService(#{service.id});")
  end

  context 'invalid Catalog items or Bundles' do
    before { allow(service).to receive(:template_valid?).and_return(false) }

    it 'disables Order button' do
      render :partial => 'catalog/svccat_tree_show'
      expect(response).not_to include("miqOrderService(#{service.id});")
    end
  end
end
