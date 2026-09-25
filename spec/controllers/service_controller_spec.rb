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

  describe "#service_retire_now" do
    let(:service)          { FactoryBot.create(:service, :service_template => service_template, :name => "foo") }
    let(:service_template) { FactoryBot.create(:service_template, :name => "bar") }

    it "creates a ServiceRetireRequest" do
      expect(controller).to receive(:assert_privileges)
      expect(controller).to receive(:javascript_redirect).with({:action => "show_list", :controller => "miq_request"})

      controller.instance_variable_set(:@record, service)
      controller.params = {:id => service.id}
      controller.send(:service_retire_now)

      expect(ServiceRetireRequest.count).to eq(1)
      expect(ServiceRetireRequest.first).to have_attributes(
        :description    => "Service Retire for: #{service.name}",
        :approval_state => "pending_approval",
        :type           => "ServiceRetireRequest",
        :request_type   => "service_retire",
        :request_state  => "pending",
        :message        => "Service Retire - Request Created",
        :status         => "Ok",
        :options        => {:src_ids => [service.id]}
      )
    end
  end

  describe "#service_reconfigure" do
    let(:dialog)           { FactoryBot.create(:dialog) }
    let(:resource_action)  { FactoryBot.create(:resource_action, :action => 'Reconfigure', :dialog => dialog) }
    let(:service_template) { FactoryBot.create(:service_template, :name => "the template", :resource_actions => [resource_action]) }
    let(:service)          { FactoryBot.create(:service, :name => "my service", :service_template => service_template) }

    before { controller.params = {:id => service.id} }

    context "when the service has a Reconfigure resource action with a dialog" do
      it "sets @dialog_locals with the correct dialog id, params, and urls" do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:drop_breadcrumb)

        controller.send(:service_reconfigure)

        expect(assigns(:dialog_locals)).to include(
          :dialogId => dialog.id,
          :params   => {
            :resourceActionId => resource_action.id,
            :targetId         => service.id,
            :targetType       => 'service'
          },
          :urls => {
            :apiSubmitEndpoint    => "/api/services/#{service.id}",
            :apiAction            => 'reconfigure',
            :cancelEndPoint       => '/service/show_list',
            :finishSubmitEndpoint => '/miq_request/show_list?typ=service/',
            :openUrl              => false
          }
        )
      end

      it "sets @in_a_form" do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:drop_breadcrumb)

        controller.send(:service_reconfigure)

        expect(assigns(:in_a_form)).to be_truthy
      end

      it "drops a breadcrumb with the service name" do
        allow(controller).to receive(:assert_privileges)
        expect(controller).to receive(:drop_breadcrumb).with(
          hash_including(:name => "Reconfigure Service \"my service\"")
        )

        controller.send(:service_reconfigure)
      end
    end

    context "when the service has no service template" do
      let(:service) { FactoryBot.create(:service, :name => "bare service") }

      it "raises an error" do
        allow(controller).to receive(:assert_privileges)

        expect { controller.send(:service_reconfigure) }.to raise_error(NoMethodError)
      end
    end

    context "when the service template has no Reconfigure resource action" do
      let(:service_template) { FactoryBot.create(:service_template, :name => "no reconfigure template") }

      it "raises an error" do
        allow(controller).to receive(:assert_privileges)

        expect { controller.send(:service_reconfigure) }.to raise_error(NoMethodError)
      end
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

  describe "#show" do
    render_views

    it 'displays generic objects as a nested list' do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user)
      controller.instance_variable_set(:@breadcrumbs, [])

      get :show, :params => {:id => service_with_go.id, :display => 'generic_objects'}
      expect(response.status).to eq(200)
      expect(assigns(:breadcrumbs)).to eq([{:name => "Services with a GO (All Generic Objects)", :url => "/service/show/#{service_with_go.id}?display=generic_objects"}])
    end

    describe "#button" do
      render_views

      before do
        stub_user(:features => :all)
        EvmSpecHelper.create_guid_miq_server_zone
        ApplicationController.handle_exceptions = true
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

  describe "breadcrumbs" do
    context "generic_objects" do
      before { get :show, :params => {:id => service_with_go.id, :display => 'generic_objects'} }

      it "contains breadcrumbs with item" do
        expect(controller.data_for_breadcrumbs.find { |x| x[:title].include?(service_with_go.name) }).to be_truthy
      end
    end

    context "helpers" do
      describe "generic_objects_list?" do
        it "returns true when user is in generic_objects section" do
          get :show, :params => {:id => service_with_go.id, :display => 'generic_objects'}

          expect(controller.send(:generic_objects_list?)).to eq(true)
        end

        it "returns true when user is not in generic_objects section" do
          get :show, :params => {:id => service_with_go.id}

          expect(controller.send(:generic_objects_list?)).to eq(false)
        end
      end

      describe "hide_record_info?" do
        it "returns false when user is in detail of generic_object" do
          get :show, :params => {:id => service_with_go.id, :display => 'generic_objects', :generic_object_id => '10101'}

          expect(controller.send(:hide_record_info?)).to eq(false)
        end

        it "returns true when user is not in detail of generic_object" do
          get :show, :params => {:id => service_with_go.id, :display => 'generic_objects'}

          expect(controller.send(:hide_record_info?)).to eq(true)
        end
      end
    end
  end

  it_behaves_like "explorer controller with custom buttons"
end
