describe "layouts/_searchbar.html.haml" do
  before do
    allow(view).to receive(:url_for)
    assign(:lastaction, 'show_list')
  end

  it 'renders Search bar and not quick search' do
    render
    expect(rendered).to include('Search by Name within results')
    expect(rendered).not_to include('quicksearchbox')
  end

  it 'renders Advanced Search and quick search' do
    allow(view).to receive(:display_adv_search?).and_return(true)
    render
    expect(rendered).to include('quicksearchbox')
    expect(rendered).to include('Advanced Search')
  end
end
