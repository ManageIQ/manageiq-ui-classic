describe "miq_ae_class/_fields_seq_form.html.haml" do
  before do
    assign(:edit, :new => {
             :fields_list => [],
             :fields      => []
           })
  end

  it "Check links in the list view", :js => true do
    render :template => "miq_ae_class/_fields_seq_form"
    expect(response).to have_text("miq_tabs_disable_inactive('#ae_tabs')")
  end
end
