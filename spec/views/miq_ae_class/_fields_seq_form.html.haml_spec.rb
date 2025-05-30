describe "miq_ae_class/_fields_seq_form.html.haml" do
  include Spec::Support::AutomationHelper

  before do
    ae_fields = {'ae_var1' => {:aetype => 'relationship', :datatype => 'string'}}
    create_ae_model(:ae_class     => "FRED",
                    :ae_instances => [],
                    :ae_fields    => ae_fields)
    assign(:ae_class, MiqAeClass.where(:name => 'FRED').first)
  end

  it "renders the React SchemaSequenceEditor component" do
    render :template => "miq_ae_class/_fields_seq_form"
    expect(rendered).to include("componentFactory('SchemaSequenceEditor'")
    expect(rendered).to include("\"classId\":\"#{MiqAeClass.where(:name => 'FRED').first.id}\"")
  end
end
