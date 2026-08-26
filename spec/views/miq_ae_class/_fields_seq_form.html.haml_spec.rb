describe "miq_ae_class/_fields_seq_form.html.haml" do
  before do
    assign(:edit, :new => {
             :fields_list => [],
             :fields      => []
           })
  end

  it "renders the schema sequencing form" do
    render :template => "miq_ae_class/_fields_seq_form"
    expect(rendered).to have_text("Class Schema Sequencing")
    expect(rendered).to have_selector("select#seq_fields")
  end
end
