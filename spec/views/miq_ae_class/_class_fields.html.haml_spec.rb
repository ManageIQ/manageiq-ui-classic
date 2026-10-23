describe "miq_ae_class/_class_fields.html.haml" do
  include Spec::Support::AutomationHelper

  context 'display class fields' do
    before do
      assign(:sb,
             :active_tab  => "schema",
             :active_tree => :ae_tree,
             :trees       => {:ae_tree => {:active_node => "aec-1"}})
      ae_fields = {'ae_var1' => {:aetype => 'relationship', :datatype => 'string', :default_value => "Wilma"}}
      create_ae_model(:ae_class     => "FRED",
                      :ae_instances => [],
                      :ae_fields    => ae_fields)

      assign(:in_a_form, false)
      assign(:ae_class, MiqAeClass.where(:name => 'FRED').first)
    end

    it "Check instance", :js => true do
      render :template => "miq_ae_class/_class_fields"
      expect(rendered).to have_text('ae_var1')
      expect(rendered).to have_text('Wilma')
    end
  end

  context 'edit class fields' do
    before do
      assign(:sb,
             :active_tab  => "schema",
             :active_tree => :ae_tree,
             :trees       => {:ae_tree => {:active_node => "aec-1"}})
      create_ae_model(:ae_class     => "FRED",
                      :ae_instances => [],
                      :ae_fields    => {'ae_var1' => {:aetype => 'relationship', :datatype => 'string', :default_value => "Wilma"}})
      @ae_class = MiqAeClass.where(:name => 'FRED').first

      assign(:in_a_form, true)
      assign(:in_a_form_fields, true)
      assign(:ae_class, @ae_class)
      assign(:combo_xml, [['Attribute', 'attribute', {'data-icon' => 'carbon--Grid'}]])
      assign(:dtype_combo_xml, [['String', 'string', {'data-icon' => 'carbon--StringText'}]])
    end

    it "renders the schema editor with the class id and the type options" do
      render :template => "miq_ae_class/_class_fields"

      expect(rendered).to include('Datastore')
      expect(rendered).to include('"isEdit":true')
      expect(rendered).to include("\"aeClassId\":#{@ae_class.id}")
      expect(rendered).to include('"aeTypeOptions":[["Attribute","attribute"')
      expect(rendered).to include('"dTypeOptions":[["String","string"')
    end
  end
end
