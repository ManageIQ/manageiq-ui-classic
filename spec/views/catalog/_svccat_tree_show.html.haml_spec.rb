describe "catalog/_svccat_tree_show.html.haml" do
  let(:service) { FactoryBot.create(:service_template) }

  before do
    assign(:record, service)
    assign(:sb, {})
  end

  it 'enables Order button' do
    render :partial => 'catalog/svccat_tree_show'
    expect(response).to include("<button name=\"button\" type=\"submit\" is_button=\"true\" text=\"Order\" title=\"Order this Service\" alt=\"Order this Service\" onclick=\"miqOrderService(&quot;#{service.id}&quot;);\" class=\"btn btn-primary\">Order</button>")
  end

  context 'invalid Catalog items or Bundles' do
    before { allow(service).to receive(:template_valid?).and_return(false) }

    it 'disables Order button' do
      render :partial => 'catalog/svccat_tree_show'
      expect(response).to include("<button name=\"button\" type=\"submit\" is_button=\"true\" text=\"Order\" title=\"This Service cannot be ordered\" alt=\"This Service cannot be ordered\" disabled=\"disabled\" onclick=\"miqOrderService(&quot;#{service.id}&quot;);\" class=\"btn btn-primary\">Order</button>")
    end
  end
end
