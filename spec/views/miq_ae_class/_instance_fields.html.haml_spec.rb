describe "miq_ae_class/_instance_fields.html.haml" do
  include Spec::Support::AutomationHelper

  context 'display instances' do
    before do
      ae_fields = {'ae_var1' => {:aetype => 'relationship', :datatype => 'string'}}
      ae_instances = {"BARNEY" => {'ae_var1' => {:value => 'hello world'}}}
      create_ae_model(:ae_class      => "FRED",
                      :instance_name => "BARNEY",
                      :ae_instances  => ae_instances,
                      :ae_fields     => ae_fields)

      @ae_class = MiqAeClass.where(:name => 'FRED').first
      @record   = MiqAeInstance.where(:name => 'BARNEY').first
    end

    it "Check instance", :js => true do
      render :partial => "miq_ae_class/instance_fields",
             :locals  => {:ae_class => @ae_class, :record => @record}
      expect(response).to have_text('ae_var1')
      expect(response).to have_text('hello world')
    end
  end
end
