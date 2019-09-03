describe "miq_ae_class/show.html.haml" do
  let(:ae_domain) { FactoryBot.create(:miq_ae_domain) }

  before do
    allow(view).to receive(:x_node).and_return("aen-#{ae_domain.id}")
    assign(:sb, :active_tab => 'details')
    assign(:records, [])
  end

  it 'renders partial all_tabs' do
    render
    expect(response).to include("<div id='ae_tabs'>", "<div id='ns_details_div'>", 'miqInitCodemirror({"text_area_id":"miq_none"')
  end
end
