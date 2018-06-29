describe ServiceController do
  include CompressedIds

  before(:each) do
    stub_user(:features => :all)
  end

  let(:go_definition) do
    FactoryGirl.create(:generic_object_definition, :properties => {:associations => {"vms" => "Vm", "services" => "Service"}})
  end

  let(:service_with_go) do
    service = FactoryGirl.create(:service, :name => 'Services with a GO')

    go = FactoryGirl.create(
      :generic_object,
      :generic_object_definition => go_definition,
      :name                      => 'go_assoc',
      :services                  => [service]
    )
    service.add_resource(go)

    service
  end

  describe "#service_reconfigure" do
    let(:service) { instance_double("Service", :id => 3000000000001, :service_template => service_template) }
    let(:service_template) { instance_double("ServiceTemplate", :name => "the name") }
    let(:ar_association_dummy) { double }
    let(:resource_action) { instance_double("ResourceAction", :id => 123) }

    before do
      allow(Service).to receive(:find_by_id).with(3000000000001).and_return(service)
      allow(service_template).to receive(:resource_actions).and_return(ar_association_dummy)
      allow(ar_association_dummy).to receive(:find_by).with(:action => 'Reconfigure').and_return(resource_action)
      allow(controller).to receive(:replace_right_cell)
      controller.instance_variable_set(:@_params, :id => "3r1")
    end

    it "sets the right cell text" do
      controller.send(:service_reconfigure)
      expect(controller.instance_variable_get(:@right_cell_text)).to eq("Reconfigure Service \"the name\"")
    end

    it "replaces the right cell with the reconfigure dialog partial" do
      expect(controller).to receive(:replace_right_cell).with(
        :action        => "reconfigure_dialog",
        :dialog_locals => {:resource_action_id => 123, :target_id => 3000000000001}
      )

      controller.send(:service_reconfigure)
    end
  end

  describe "#service_delete" do
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

    context 'setting x_node properly after deleting a service from its details page' do
      let(:service) { FactoryGirl.create(:service) }

      before do
        allow(controller).to receive(:replace_right_cell)
        controller.instance_variable_set(:@_params, :id => service.id)
      end

      it 'sets x_node to return to Active Services' do
        controller.send(:service_delete)
        expect(controller.x_node).to eq("xx-asrv")
      end

      it 'sets x_node to return to Retired Services' do
        service.update_attributes(:retired => true)
        controller.send(:service_delete)
        expect(controller.x_node).to eq("xx-rsrv")
      end
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

      get :show, :params => { :id => service_with_go.id, :display => 'generic_objects'}
      expect(response.status).to eq(200)
      expect(assigns(:breadcrumbs)).to eq([{:name => "Services with a GO (All Generic Objects)", :url => "/service/show/#{service_with_go.id}?display=generic_objects"}])
    end

    it 'displays the selected generic object' do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      controller.instance_variable_set(:@breadcrumbs, [])
      service = FactoryGirl.create(:service, :name => "Abc")
      go1 = FactoryGirl.create(:generic_object,
                               :generic_object_definition => go_definition,
                               :name                      => 'GOTest_1',
                               :services                  => [service])
      go1.add_to_service(service)

      go2 = FactoryGirl.create(:generic_object,
                               :generic_object_definition => go_definition,
                               :name                      => 'GOTest_2',
                               :services                  => [service])
      go2.add_to_service(service)
      get :show, :params => { :id => service.id, :display => 'generic_objects', :generic_object_id => go2.id}
      expect(response.status).to eq(200)
      expect(assigns(:breadcrumbs)).to eq([{:name => "Abc (All Generic Objects)", :url => "/service/show/#{service.id}?display=generic_objects"},
                                           {:name => "GOTest_2", :url => "/service/show/#{service.id}?display=generic_objects&generic_object_id=#{go2.id}"}])
    end

    it 'redirects to service detail page when Services maintab is clicked right after viewing the GO object' do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      controller.instance_variable_set(:@breadcrumbs, [])
      service = FactoryGirl.create(:service, :name => "Abc")
      go = FactoryGirl.create(
        :generic_object,
        :generic_object_definition => go_definition,
        :name                      => 'GOTest',
        :services                  => [service]
      )
      go.add_to_service(service)
      get :show, :params => { :id => service.id, :display => 'generic_objects', :generic_object_id => go.id}
      expect(response.status).to eq(200)
      expect(assigns(:breadcrumbs)).to eq([{:name => "Abc (All Generic Objects)", :url => "/service/show/#{service.id}?display=generic_objects"},
                                           {:name => "GOTest", :url => "/service/show/#{service.id}?display=generic_objects&generic_object_id=#{go.id}"}])
      is_expected.to render_template("service/show")

      get :show, :params => { :id => service.id}
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'explorer', :id => "s-#{service.id}")
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
        go = FactoryGirl.create(
          :generic_object,
          :generic_object_definition => go_definition,
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

  context "Generic Object instances in Textual Summary" do
    it "displays Generic Objects in Ansible Playbook Service Textual Summary" do
      record = FactoryGirl.create(:service_ansible_playbook)
      controller.instance_variable_set(:@record, record)
      expect(controller.send(:textual_group_list)).to include(array_including(:generic_objects))
    end

    it "displays Generic Objects for all other Services" do
      record = FactoryGirl.create(:service)
      controller.instance_variable_set(:@record, record)
      expect(controller.send(:textual_group_list)).to include(array_including(:generic_objects))
    end
  end

  context 'displaying a list of All Services' do
    describe '#tree_select' do
      render_views

      let(:service_search) { FactoryGirl.create(:miq_search, :description => 'a', :db => 'Service') }

      it 'renders GTL of All Services, filtered by choosen filter from accordion' do
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'Service',
          :report_data_additional_options => {
            :model       => 'Service',
            :named_scope => nil
          }
        )
        expect(controller).to receive(:process_show_list).once.and_call_original
        post :tree_select, :params => {:id => "ms-#{to_cid(service_search.id)}"}
        expect(response.status).to eq(200)
      end

      it 'calls load_adv_search method to load filter from filters in accordion' do
        expect(controller).to receive(:load_adv_search).once
        post :tree_select, :params => {:id => "ms-#{to_cid(service_search.id)}"}
        expect(response.status).to eq(200)
      end
    end

    context 'applying filter from Advanced Search' do
      describe '#get_node_info' do
        let(:edit) { {:new => {}, :adv_search_applied => {:text => " - Filtered by Filter1"}} }

        before do
          controller.instance_variable_set(:@edit, edit)
          controller.instance_variable_set(:@right_cell_text, nil)
          controller.instance_variable_set(:@sb, {})
        end

        it 'does not call load_adv_search method' do
          expect(controller).not_to receive(:load_adv_search)
          controller.send(:get_node_info, "root")
        end

        it 'calls process_show_list method' do
          expect(controller).to receive(:process_show_list)
          controller.send(:get_node_info, "root")
        end

        it 'sets right cell text properly' do
          allow(controller).to receive(:x_tree).and_return("type" => :svcs)
          controller.send(:get_node_info, "root")
          expect(controller.instance_variable_get(:@right_cell_text)).to eq("All Services - Filtered by Filter1")
        end

        context 'searching text' do
          let(:search) { "Service" }

          before do
            controller.instance_variable_set(:@search_text, search)
          end

          it 'updates right cell text properly' do
            controller.send(:get_node_info, "root")
            expect(controller.instance_variable_get(:@right_cell_text)).to eq("All Services (Names with \"#{search}\")")
          end
        end
      end
    end
  end

  it_behaves_like "explorer controller with custom buttons"
end
