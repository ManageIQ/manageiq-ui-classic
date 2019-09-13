describe 'provider_foreman/show.html.haml' do
  helper(GtlHelper)

  let(:foreman) { FactoryBot.create(:configuration_manager) }

  before { assign(:record, foreman) }

  it 'renders show template' do
    expect(view).to receive(:render_gtl_outer)
    render
    expect(view).to render_template(:partial => 'shared/provider_paused', :locals => {:record => foreman})
  end
end
