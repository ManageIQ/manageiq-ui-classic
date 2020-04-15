describe "layouts/_center_div_no_listnav.html.haml" do
  let(:user) { FactoryBot.create(:user) }

  before do
    allow(view).to receive(:calculate_toolbars).and_return(:center_tb => 'ansible_playbooks_center')
    allow(view).to receive(:show_search?).and_return(true)
    allow(view).to receive(:taskbar_in_header?).and_return(true)
    allow(view).to receive(:url_for)
    assign(:lastaction, 'show_list')
    login_as user
  end

  it 'renders Search bar' do
    render
    expect(rendered).to include('Search by Name within results')
  end
end
