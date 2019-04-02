describe "catalog/_ot_add.html.haml" do
  before do
    set_controller_for_view("catalog")
    set_controller_for_view_to_be_nonrestful
    @edit = {:new => {}}
    assign(:sb, :active_accordion => 'ot_accord')
  end

  it "the orchestration type dropdown includes the vApp type" do
    render
    expect(rendered).to include('VMWare vApp')
  end
end
