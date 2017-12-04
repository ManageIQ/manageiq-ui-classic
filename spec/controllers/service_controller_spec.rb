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

    it 'displays one generic object from the nested list' do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      controller.instance_variable_set(:@breadcrumbs, [])
      service = FactoryGirl.create(:service, :name => "Abc")
      definition = FactoryGirl.create(:generic_object_definition,
                                      :properties => {:associations => {"vms" => "Vm", "services" => "Service"}})
      go = FactoryGirl.create(
        :generic_object,
        :generic_object_definition => definition,
        :name                      => 'GOTest',
        :services                  => [service]
      )
      go.add_to_service(service)
      get :generic_object, :params => { :id => service.id, :show => go.id}
      expect(response.status).to eq(200)
      expect(assigns(:breadcrumbs)).to eq([{:name => "Abc (All Generic Objects)", :url => "/service/show/#{service.id}"},
                                           {:name => "GOTest", :url => "/service/show/#{service.id}?display=generic_objects/show=#{go.id}"}])
    end

    context "#button" do
      render_views

      before(:each) do
        stub_user(:features => :all)
        EvmSpecHelper.create_guid_miq_server_zone
        ApplicationController.handle_exceptions = true
      end

      it "when Generic Object Tag is pressed for the generic object nested list" do
        service = FactoryGirl.create(:service, :name => "Service with Generic Objects")
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

        post :button, :params => {:pressed => "generic_object_tag", "check_#{go.id}" => "1", :format => :js, :id => service.id, :display => 'generic_objects' }
        expect(response.status).to eq(200)
        expect(response.body).to include('service/tagging_edit')
      end
    end
  end

  context "#sanitize_output" do
    it "escapes characters in the output string" do
      output = controller.send(:sanitize_output, "I'm \"\\'Fred\\'\" {{Flintstone}}")
      expect(output).to eq("I\\'m \\\"\\'Fred\\'\\\" \\{\\{Flintstone\\}\\}")
    end
  end

  context 'displaying a service with associated VMs' do
    let(:service) { FactoryGirl.create(:service) }

    let!(:vm) do
      vm = FactoryGirl.create(:vm)
      vm.add_to_service(service)
      vm
    end

    describe "#report_data" do
      it 'returns VMs associated to the selected Service' do
        report_data_request(
          :model         => 'Vm',
          :parent_model  => 'Service',
          :parent_id     => service.id,
          :active_tree   => 'svcs_tree',
          :parent_method => 'all_vms'
        )
        results = assert_report_data_response
        expect(results['data']['rows'].length).to eq(1)
        expect(results['data']['rows'][0]['long_id']).to eq(vm.id.to_s)
      end
    end

    # Request URL:http://localhost:3000/service/tree_select?id=s-10r219
    describe '#tree_select' do
      render_views

      it 'renders GTL of VMs associated to the selected Service' do
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'Vm',
          :parent_id                      => service.id,
          :report_data_additional_options => {
            :parent_class_name => 'Service',
            :parent_method     => :all_vms,
          }
        )
        post :tree_select, :params => {:id => "s-#{service.id}"}
        expect(response.status).to eq(200)
      end
    end
  end

  # Request URL: http://localhost:3000/service/tree_select?id=xx-asrv
  context 'displaying a list of Active Services' do
    describe '#tree_select' do
      render_views

      it 'renders GTL of Active services' do
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'Service',
          :report_data_additional_options => {
            :named_scope => [[:retired, false], :displayed]
          }
        )
        post :tree_select, :params => {:id => 'xx-asrv'}
        expect(response.status).to eq(200)
      end
    end
  end

  context 'displaying a list of Retired Services' do
    describe '#tree_select' do
      render_views

      it 'renders GTL of Retired services' do
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'Service',
          :report_data_additional_options => {
            :named_scope => [:retired, :displayed]
          }
        )
        post :tree_select, :params => {:id => 'xx-rsrv'}
        expect(response.status).to eq(200)
      end
    end
  end

  it_behaves_like "explorer controller with custom buttons"
end
