describe ServiceController do
  before(:each) do
    stub_user(:features => :all)
  end

  context "#service_delete" do
    it "display flash message with description of deleted Service" do
      st  = FactoryGirl.create(:service_template)
      svc = FactoryGirl.create(:service, :service_template => st, :name => "GemFire", :description => "VMware vFabric GEMFIRE")

      controller.instance_variable_set(:@record, svc)
      controller.instance_variable_set(:@sb,
                                       :trees       => {
                                         :svcs_tree => {:active_node => svc.id.to_s}
                                       },
                                       :active_tree => :svcs_tree
                                      )

      allow(controller).to receive(:replace_right_cell)

      # Now delete the Service
      controller.instance_variable_set(:@_params, :id => svc.id)
      controller.send(:service_delete)

      # Check for Service Description to be part of flash message displayed
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Service \"GemFire\": Delete successful")

      expect(controller.send(:flash_errors?)).not_to be_truthy
    end
  end

  describe 'x_button' do
    before do
      ApplicationController.handle_exceptions = true
    end

    describe 'corresponding methods are called for allowed actions' do
      ServiceController::SERVICE_X_BUTTON_ALLOWED_ACTIONS.each_pair do |action_name, method|
        it "calls the appropriate method: '#{method}' for action '#{action_name}'" do
          expect(controller).to receive(method)
          get :x_button, :params => { :pressed => action_name }
        end
      end
    end

    it 'exception is raised for unknown action' do
      get :x_button, :params => { :pressed => 'random_dude', :format => :html }
      expect(response).to render_template('layouts/exception')
    end
  end

  context "#service_delete" do
    it "replaces right cell after service is deleted" do
      service = FactoryGirl.create(:service)
      allow(controller).to receive(:x_build_tree)
      controller.instance_variable_set(:@settings, {})
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_params, :id => service.id)
      expect(controller).to receive(:render)
      expect(response.status).to eq(200)
      controller.send(:service_delete)

      flash_message = assigns(:flash_array).first
      expect(flash_message[:message]).to include("Delete successful")
      expect(flash_message[:level]).to be(:success)
    end
  end

  context "#show" do
    render_views

    it 'contains the associated tags for the ansible service template' do
      EvmSpecHelper.local_miq_server
      record = FactoryGirl.create(:service_ansible_playbook)
      get :explorer, :params => { :id => "s-#{record.id}" }
      expect(response.status).to eq(200)
      expect(response.body).to include('Smart Management')
    end

    it 'displays generic objects as a nested list' do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      controller.instance_variable_set(:@breadcrumbs, [])
      service = FactoryGirl.create(:service, :name => "Abc")
      definition = FactoryGirl.create(:generic_object_definition,
                                      :properties => {:associations => {"vms" => "Vm", "services" => "Service"}})
      go = FactoryGirl.create(
        :generic_object,
        :generic_object_definition => definition,
        :name                      => 'go_assoc',
        :services                  => [service]
      )
      service.add_resource(go)

      get :show, :params => { :id => service.id, :display => 'generic_objects'}
      expect(response.status).to eq(200)
      expect(assigns(:breadcrumbs)).to eq([{:name => "Abc (All Generic Objects)", :url => "/service/show/#{service.id}?display=generic_objects"}])
    end
  end

  context "#sanitize_output" do
    it "escapes characters in the output string" do
      output = controller.send(:sanitize_output, "I'm \"Fred\" {{Flintstone}}")
      expect(output).to eq("I\\'m \\\"Fred\\\" \\{\\{Flintstone\\}\\}")
    end
  end

  it_behaves_like "explorer controller with custom buttons"
end
