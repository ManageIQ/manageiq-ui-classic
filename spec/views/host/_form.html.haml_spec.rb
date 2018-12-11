describe "rendering fields in host new/edit form" do
  before do
    set_controller_for_view("host")
    set_controller_for_view_to_be_nonrestful
    allow(controller).to receive(:validate_before_save?).and_return(false)
    @host = FactoryBot.create(:host)
    @edit = {:new => @host}
  end

  it "displays Host Name" do
    render :partial => "host/form"
    expect(rendered).to match(/Hostname/)
  end

  it "doesn't display IP Address" do
    render :partial => "host/form"
    expect(rendered).not_to start_with('IP Address')
  end
end
