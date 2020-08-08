describe ServiceController do
  before do
    stub_user(:features => :all)
    EvmSpecHelper.local_miq_server
  end

  let(:go_definition) do
    FactoryBot.create(:generic_object_definition, :properties => {:associations => {"vms" => "Vm", "services" => "Service"}})
  end

  let(:service_with_go) do
    service = FactoryBot.create(:service, :name => 'Services with a GO')

    go = FactoryBot.create(
      :generic_object,
      :generic_object_definition => go_definition,
      :name                      => 'go_assoc',
      :services                  => [service]
    )
    service.add_resource(go)

    service
  end

  describe "#service_reconfigure" do
    let(:service) { instance_double("Service", :id => 321, :service_template => service_template, :name => "foo name") }
    let(:service_template) { instance_double("ServiceTemplate", :name => "the name") }
    let(:ar_association_dummy) { double }
    let(:resource_action) { instance_double("ResourceAction", :id => 123) }

    before do
      allow(Service).to receive(:find_by).with(:id => 321).and_return(service)
      allow(service_template).to receive(:resource_actions).and_return(ar_association_dummy)
      allow(ar_association_dummy).to receive(:find_by).with(:action => 'Reconfigure').and_return(resource_action)
      allow(controller).to receive(:replace_right_cell)
      controller.params = {:id => 321}
    end

    it "sets the right cell text" do
      controller.send(:service_reconfigure)
      expect(controller.instance_variable_get(:@right_cell_text)).to eq("Reconfigure Service \"foo name\"")
    end

    it "replaces the right cell with the reconfigure dialog partial" do
      expect(controller).to receive(:replace_right_cell).with(
        :action        => "reconfigure_dialog",
        :dialog_locals => {:resource_action_id => 123, :target_id => 321}
      )

      controller.send(:service_reconfigure)
    end
  end

  describe "#service_delete" do
    it "display flash message with description of deleted Service" do
      st  = FactoryBot.create(:service_template)
      svc = FactoryBot.create(:service, :service_template => st, :name => "GemFire", :description => "VMware vFabric GEMFIRE")

      controller.instance_variable_set(:@record, svc)
      controller.instance_variable_set(:@sb,
                                       :trees       => {
                                         :svcs_tree => {:active_node => svc.id.to_s}
                                       },
                                       :active_tree => :svcs_tree)

      allow(controller).to receive(:replace_right_cell)

      # Now delete the Service
      controller.params = {:id => svc.id}
      controller.send(:service_delete)

      # Check for Service Description to be part of flash message displayed
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Service \"GemFire\": Delete successful")

      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "replaces right cell after service is deleted" do
      service = FactoryBot.create(:service)
      allow(controller).to receive(:x_build_tree)
      controller.instance_variable_set(:@settings, {})
      controller.instance_variable_set(:@sb, {})
      controller.params = {:id => service.id}
      expect(controller).to receive(:render)
      expect(response.status).to eq(200)
      controller.send(:service_delete)

      flash_message = assigns(:flash_array).first
      expect(flash_message[:message]).to include("Delete successful")
      expect(flash_message[:level]).to be(:success)
    end

    context 'setting x_node properly after deleting a service from its details page' do
      let(:service) { FactoryBot.create(:service) }

      before do
        allow(controller).to receive(:replace_right_cell)
        controller.params = {:id => service.id}
      end

      it 'sets x_node to return to Active Services' do
        controller.send(:service_delete)
        expect(controller.x_node).to eq("xx-asrv")
      end

      it 'sets x_node to return to Retired Services' do
        service.update(:retired => true)
        controller.send(:service_delete)
        expect(controller.x_node).to eq("xx-rsrv")
      end
    end
  end

  describe '#x_button' do
    before { ApplicationController.handle_exceptions = true }

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

  describe "#show" do
    render_views

    it 'contains the associated tags for the ansible service template' do
      EvmSpecHelper.local_miq_server
      record = FactoryBot.create(:service_ansible_playbook)
      get :explorer, :params => { :id => "s-#{record.id}" }
      expect(response.status).to eq(200)
      expect(response.body).to include('Smart Management')
    end

    it 'displays the associated custom attributes for the ansible service template' do
      EvmSpecHelper.local_miq_server
      record = FactoryBot.create(:service_ansible_playbook)
      record.custom_attributes << FactoryBot.build(:miq_custom_attribute,
                                                    :resource_type => "ServiceAnsiblePlaybook",
                                                    :resource_id   => record.id,
                                                    :name          => "custom_attribute_1",
                                                    :value         => 'value1')
      get :explorer, :params => { :id => "s-#{record.id}" }
      expect(response.status).to eq(200)
      expect(response.body).to include('Custom Attributes')
    end

    it 'displays generic objects as a nested list' do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user)
      controller.instance_variable_set(:@breadcrumbs, [])

      get :show, :params => { :id => service_with_go.id, :display => 'generic_objects'}
      expect(response.status).to eq(200)
      expect(assigns(:breadcrumbs)).to eq([{:name => "Services with a GO (All Generic Objects)", :url => "/service/show/#{service_with_go.id}?display=generic_objects"}])
    end

    it 'displays the selected generic object' do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user)
      controller.instance_variable_set(:@breadcrumbs, [])
      service = FactoryBot.create(:service, :name => "Abc")
      go1 = FactoryBot.create(:generic_object,
                               :generic_object_definition => go_definition,
                               :name                      => 'GOTest_1',
                               :services                  => [service])
      go1.add_to_service(service)

      go2 = FactoryBot.create(:generic_object,
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
      login_as FactoryBot.create(:user)
      controller.instance_variable_set(:@breadcrumbs, [])
      service = FactoryBot.create(:service, :name => "Abc")
      go = FactoryBot.create(
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

    describe "#button" do
      render_views

      before do
        stub_user(:features => :all)
        EvmSpecHelper.create_guid_miq_server_zone
        ApplicationController.handle_exceptions = true
      end

      it "when Generic Object Tag is pressed for the generic object nested list" do
        service = FactoryBot.create(:service, :name => "Service with Generic Objects")
        go = FactoryBot.create(
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

      it 'returns proper record class' do
        expect(controller.send(:record_class)).to eq(Service)
      end
    end
  end

  describe "#sanitize_output" do
    it "escapes characters in the output string" do
      output = controller.send(:sanitize_output, "I'm \"\\'Fred\\'\" {{Flintstone}}")
      expect(output).to eq("I\\'m \\\"\\'Fred\\'\\\" \\{\\{Flintstone\\}\\}")
    end
  end

  context 'displaying a service with associated VMs' do
    let(:service) { FactoryBot.create(:service) }

    let!(:vm) do
      vm = FactoryBot.create(:vm)
      vm.add_to_service(service)
      vm
    end

    describe "#report_data" do
      it 'returns VMs associated to the selected Service' do
        report_data_request(
          :model         => 'Vm',
          :parent_model  => 'Service',
          :parent_id     => service.id.to_s,
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
          :parent_id                      => service.id.to_s,
          :report_data_additional_options => {
            :parent_class_name => 'Service',
            :parent_method     => :all_vms,
          }
        )
        post :tree_select, :params => {:id => "s-#{service.id}", :tree => 'svcs_tree'}
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
        post :tree_select, :params => {:id => 'xx-asrv', :tree => 'svcs_tree'}
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
            :named_scope => %i(retired displayed)
          }
        )
        post :tree_select, :params => {:id => 'xx-rsrv', :tree => 'svcs_tree'}
        expect(response.status).to eq(200)
      end
    end
  end

  context "Generic Object instances in Textual Summary" do
    it "displays Generic Objects in Ansible Playbook Service Textual Summary" do
      record = FactoryBot.create(:service_ansible_playbook)
      controller.instance_variable_set(:@record, record)
      expect(controller.send(:textual_group_list)).to include(array_including(:generic_objects))
    end

    it "displays Generic Objects for all other Services" do
      record = FactoryBot.create(:service)
      controller.instance_variable_set(:@record, record)
      expect(controller.send(:textual_group_list)).to include(array_including(:generic_objects))
    end
  end

  context 'displaying a list of All Services' do
    describe '#tree_select' do
      before { allow(controller).to receive(:data_for_breadcrumbs).and_return([{:title => "title", :action => "action", :key => "key"}]) }

      render_views

      let(:service_search) { FactoryBot.create(:miq_search, :description => 'a', :db => 'Service') }

      it 'renders GTL of All Services, filtered by choosen filter from accordion' do
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'Service',
          :report_data_additional_options => {
            :model       => 'Service',
            :named_scope => nil
          }
        )
        expect(controller).to receive(:process_show_list).once.and_call_original
        post :tree_select, :params => {:id => "ms-#{service_search.id}", :tree => 'svcs_tree'}
        expect(response.status).to eq(200)
      end

      it 'calls load_adv_search method to load filter from filters in accordion' do
        expect(controller).to receive(:load_adv_search).once
        post :tree_select, :params => {:id => "ms-#{service_search.id}", :tree => 'svcs_tree'}
        expect(response.status).to eq(200)
      end
    end

    context 'applying filter from Advanced Search' do
      describe '#get_node_info' do
        let(:edit) { {:new => {}, :adv_search_applied => {:text => " - Filtered by Filter1"}} }

        before do
          allow(controller).to receive(:session).and_return(:edit => edit)
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

          before { controller.instance_variable_set(:@search_text, search) }

          it 'updates right cell text properly' do
            controller.send(:get_node_info, "root")
            expect(controller.instance_variable_get(:@right_cell_text)).to eq("All Services (Names with \"#{search}\")")
          end
        end
      end
    end
  end

  context 'clicking on Active/Retired Services node in the tree, after applying a filter' do
    describe '#get_node_info' do
      let(:edit) do
        {
          :expression         => expression,
          :new                => {:expression => {'CONTAINS' => {'tag' => 'Some tag', 'value' => 'test'}}},
          :adv_search_name    => 'Some filter',
          :new_search_name    => 'Some filter',
          :adv_search_applied => {:text => " - Filtered by \"Some filter\"",
                                  :exp  => {'CONTAINS' => {'tag' => 'Some tag', 'value' => 'test'}}}
        }
      end

      let(:expression) do
        ApplicationController::Filter::Expression.new.tap do |e|
          e.expression = {'CONTAINS' => {'tag' => 'Some tag', 'value' => 'test'}, :token => 2}
          e.exp_table = [["Service.My Company Tags : Some tag CONTAINS 'Test'", 2]]
          e.exp_token = nil
          e.history = ApplicationController::Filter::ExpressionEditHistory.new([{'CONTAINS' => {'tag' => 'Some tag', 'value' => 'test'}, :token => 2}])
          e.selected = {:id => 123, :name => 'Some filter', :description => 'Some filter', :typ => 'default'}
        end
      end

      let(:new_expression) do
        ApplicationController::Filter::Expression.new.tap do |e|
          e.expression = {'???' => '???', :token => 3}
          e.exp_key = '???'
          e.exp_orig_key = '???'
          e.exp_table = [['???', 3]]
          e.exp_token = 3
          e.history = ApplicationController::Filter::ExpressionEditHistory.new([{'???' => '???'}])
          e.selected = {:id => 0, :description => 'All'}
          e.val1 = e.val2 = {:type => nil}
        end
      end

      before do
        allow(controller).to receive(:session).and_return(:adv_search => {"Service" => edit}, :edit => edit)
        controller.params = {:action => 'tree_select'}
        controller.instance_variable_set(:@edit, edit)
        controller.instance_variable_set(:@expkey, :expression)
        controller.instance_variable_set(:@explorer, true)
        controller.instance_variable_set(:@sb, {})
      end

      it 'sets session to default values, for Active Services' do
        controller.send(:get_node_info, 'xx-asrv')
        expect(controller.session[:edit][:expression]).to eq(new_expression)
        expect(controller.session[:edit]).to eq(controller.session[:adv_search]["Service"])
      end

      it 'calls listnav_search_selected' do
        expect(controller).to receive(:listnav_search_selected).with(0)
        controller.send(:get_node_info, 'xx-rsrv')
      end
    end
  end

  describe '#get_node_info' do
    let(:edit) { {:new => {}, :adv_search_applied => {:text => " - Filtered by Filter1"}} }

    before do
      allow(controller).to receive(:session).and_return(:edit => edit)
      controller.instance_variable_set(:@sb, {})
    end

    it 'sets @edit according to the session[:edit]' do
      controller.send(:get_node_info, 'xx-rsrv')
      expect(controller.instance_variable_get(:@edit)).to eq(controller.session[:edit])
    end
  end

  describe "breadcrumbs" do
    context "generic_objects" do
      before { get :show, :params => { :id => service_with_go.id, :display => 'generic_objects'} }

      it "contains url to all services" do
        expect(controller.data_for_breadcrumbs.find { |x| x[:title] == 'My services' }[:url]).to end_with('service/explorer')
      end

      it "contains breadcrumbs with item" do
        expect(controller.data_for_breadcrumbs.find { |x| x[:title].include?(service_with_go.name) }).to be_truthy
      end
    end

    context "helpers" do
      describe "generic_objects_list?" do
        it "returns true when user is in generic_objects section" do
          get :show, :params => { :id => service_with_go.id, :display => 'generic_objects'}

          expect(controller.send(:generic_objects_list?)).to eq(true)
        end

        it "returns true when user is not in generic_objects section" do
          get :show, :params => { :id => service_with_go.id }

          expect(controller.send(:generic_objects_list?)).to eq(false)
        end
      end

      describe "hide_record_info?" do
        it "returns false when user is in detail of generic_object" do
          get :show, :params => { :id => service_with_go.id, :display => 'generic_objects', :generic_object_id => '10101'}

          expect(controller.send(:hide_record_info?)).to eq(false)
        end

        it "returns true when user is not in detail of generic_object" do
          get :show, :params => { :id => service_with_go.id, :display => 'generic_objects' }

          expect(controller.send(:hide_record_info?)).to eq(true)
        end
      end
    end
  end

  it_behaves_like "explorer controller with custom buttons"
end
