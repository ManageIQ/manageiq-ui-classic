describe EmsInfraController do
  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryBot.build(:zone) }

  describe "#button" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone

      ApplicationController.handle_exceptions = true
    end

    it "EmsInfra check compliance is called when Compliance is pressed" do
      ems_infra = FactoryBot.create(:ems_vmware)
      expect(controller).to receive(:check_compliance).and_call_original
      post :button, :params => {:pressed => "ems_infra_check_compliance", :format => :js, :id => ems_infra.id}
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(assigns(:flash_array).first[:message]).to include('Check Compliance successfully initiated')
    end

    it "when VM Right Size Recommendations is pressed" do
      expect(controller).to receive(:vm_right_size)
      post :button, :params => { :pressed => "vm_right_size", :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Migrate is pressed" do
      expect(controller).to receive(:prov_redirect).with("migrate")
      post :button, :params => { :pressed => "vm_migrate", :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Migrate is pressed" do
      ems = FactoryBot.create(:ems_vmware)
      vm = FactoryBot.create(:vm_vmware, :ext_management_system => ems)
      post :button, :params => { :pressed => "vm_migrate", :format => :js, "check_#{vm.id}" => 1, :id => ems.id }
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(response.body).to include("/miq_request/prov_edit?")
      expect(response.status).to eq(200)
    end

    it "when VM Retire is pressed" do
      expect(controller).to receive(:retirevms).once
      post :button, :params => { :pressed => "vm_retire", :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Manage Policies is pressed" do
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      post :button, :params => { :pressed => "vm_protect", :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Manage Policies is pressed" do
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      post :button, :params => { :pressed => "miq_template_protect", :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Tag is pressed" do
      expect(controller).to receive(:tag).with(VmOrTemplate)
      post :button, :params => { :pressed => "vm_tag", :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Tag is pressed" do
      expect(controller).to receive(:tag).with(VmOrTemplate)
      post :button, :params => { :pressed => 'miq_template_tag', :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "should set correct VM for right-sizing when on list of VM's of another CI" do
      ems_infra = FactoryBot.create(:ext_management_system)
      vm = FactoryBot.create(:vm_vmware, :ext_management_system => ems_infra)
      allow(controller).to receive(:find_records_with_rbac) { [vm] }
      post :button, :params => { :pressed => "vm_right_size", :id => ems_infra.id, :display => 'vms', "check_#{vm.id}" => '1' }
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(response.body).to include("/vm/right_size/#{vm.id}")
    end

    it "when Host Analyze then Check Compliance is pressed" do
      ems_infra = FactoryBot.create(:ems_vmware)
      expect(controller).to receive(:analyze_check_compliance_hosts)
      post :button, :params => {:pressed => "host_analyze_check_compliance", :id => ems_infra.id, :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when vm_transform_mass is pressed" do
      ems_infra = FactoryBot.create(:ems_vmware)
      expect(controller).to receive(:vm_transform_mass)
      post :button, :params => {:pressed => "vm_transform_mass", :id => ems_infra.id, :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    context 'operations on Clusters, Orchestration Stacks, Datastores of selected Provider' do
      before do
        controller.params = {:pressed => pressed}
        controller.instance_variable_set(:@display, display)
      end

      context 'SSA on selected Clusters from a nested list' do
        let(:pressed) { 'ems_cluster_scan' }
        let(:display) { 'ems_clusters' }

        it 'returns proper record class' do
          expect(controller.send(:record_class)).to eq(EmsCluster)
        end
      end

      context 'retirement for Orchestration Stacks displayed in a nested list' do
        let(:pressed) { 'orchestration_stack_retire_now' }
        let(:display) { 'orchestration_stacks' }

        it 'returns proper record class' do
          expect(controller.send(:record_class)).to eq(OrchestrationStack)
        end
      end

      context 'SSA on selected Datastores from a nested list' do
        let(:pressed) { 'storage_scan' }
        let(:display) { 'storages' }

        it 'returns proper record class' do
          expect(controller.send(:record_class)).to eq(Storage)
        end
      end
    end

    context 'Check Compliance of Last Known Configuration on VMs' do
      let(:vm) { FactoryBot.create(:vm_vmware) }
      let(:ems_infra) { FactoryBot.create(:ems_vmware) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'vms')
        controller.params = {:miq_grid_checks => vm.id.to_s, :pressed => 'vm_check_compliance', :id => ems_infra.id.to_s, :controller => 'ems_infra'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          vm.add_policy(policy)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end

  describe "#create" do
    before do
      # USE: stub_user :features => %w(ems_infra_new ems_infra_edit)
      user = FactoryBot.create(:user, :features => %w(ems_infra_new ems_infra_edit))

      allow(user).to receive(:server_timezone).and_return("UTC")
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      login_as user
    end

    it "adds a new provider" do
      allow(controller).to receive(:previous_breadcrumb_url).and_return("previous-url")
      get :new
      expect(response.status).to eq(200)
    end
  end

  describe "#scaling" do
    before do
      stub_user(:features => :all)
      @ems = FactoryBot.create(:ems_infra, :hosts => [FactoryBot.create(:host), FactoryBot.create(:host)])
      allow(controller).to receive(:get_infra_provider).and_return(@ems)
      p1 = FactoryBot.create(:orchestration_stack_parameter, :name => "compute-1::count", :value => 1)
      p2 = FactoryBot.create(:orchestration_stack_parameter, :name => "controller-1::count", :value => 1)
      stack_parameters = [p1, p2]
      @orchestration_stack = FactoryBot.create(:orchestration_stack, :parameters => stack_parameters)
      allow(@ems).to receive(:direct_orchestration_stacks).and_return([@orchestration_stack])
      @orchestration_stack_parameter_compute = FactoryBot.create(:orchestration_stack_parameter_openstack_infra_compute)
    end

    it "when values are not changed" do
      post :scaling, :params => { :id => @ems.id, :scale => "", :orchestration_stack_id => @orchestration_stack.id }
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include(
        "A value must be changed or provider stack will not be updated."
      )
    end

    it "when values are changed, but exceed number of hosts available" do
      post :scaling, :params => { :id => @ems.id, :scale => "", :orchestration_stack_id => @orchestration_stack.id,
           @orchestration_stack_parameter_compute.name => @ems.hosts.count * 2 }
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include(
        "Assigning #{@ems.hosts.count * 2} but only have #{@ems.hosts.count} hosts available."
      )
    end

    it "when values are changed, values do not exceed number of hosts available" do
      expect(@orchestration_stack).to receive(:scale_up_queue)
      post :scaling, :params => { :id => @ems.id, :scale => "", :orchestration_stack_id => @orchestration_stack.id,
                                  @orchestration_stack_parameter_compute.name => 2 }
      expect(controller.send(:flash_errors?)).to be_falsey
      expect(response.body).to include("redirected")
      expect(response.body).to include("ems_infra")
      expect(session[:flash_msgs]).to match [a_hash_including(:message => "Scaling compute-1::count from 1 to 2 ", :level => :success)]
    end

    it "when no orchestration stack is available" do
      allow(@ems).to receive(:direct_orchestration_stacks).and_return([])
      post :scaling, :params => { :id => @ems.id, :scale => "", :orchestration_stack_id => nil }
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Orchestration stack could not be found.")
    end
  end

  describe "#scaledown" do
    before do
      stub_user(:features => :all)
      @host1 = FactoryBot.create(:host_openstack_infra_compute, :maintenance => false)
      @host2 = FactoryBot.create(:host_openstack_infra_compute_maintenance)
      @ems = FactoryBot.create(:ems_openstack_infra, :hosts => [@host1, @host2])
      allow(controller).to receive(:get_infra_provider).and_return(@ems)
      allow(controller).to receive(:get_hosts_to_scaledown_from_ids).and_return([@host2])
      p1 = FactoryBot.create(:orchestration_stack_parameter, :name => "compute-1::count", :value => 1)
      p2 = FactoryBot.create(:orchestration_stack_parameter, :name => "controller-1::count", :value => 1)
      stack_parameters = [p1, p2]
      r1 = FactoryBot.create(:orchestration_stack_resource, :physical_resource => @host1.ems_ref)
      r2 = FactoryBot.create(:orchestration_stack_resource, :physical_resource => "1", :logical_resource => "1")
      stack_resources = [r1, r2]
      @orchestration_stack = FactoryBot.create(:orchestration_stack, :parameters => stack_parameters, :resources => stack_resources)
      allow(@orchestration_stack).to receive(:update_ready?).and_return(true)
      allow(@ems).to receive(:direct_orchestration_stacks).and_return([@orchestration_stack])
      allow(@ems).to receive(:orchestration_stacks).and_return([@orchestration_stack])
      allow(controller).to receive(:find_record_with_rbac).and_return(@orchestration_stack)
      @orchestration_stack_parameter_compute = FactoryBot.create(:orchestration_stack_parameter_openstack_infra_compute)
    end

    it "when no compute hosts are selected" do
      post :scaledown, :params => {:id => @ems.id, :scaledown => "",
           :orchestration_stack_id => @orchestration_stack.id, :host_ids => []}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("No compute hosts were selected for scale down.")
    end

    it "when values are changed, but selected host is in incorrect state" do
      allow(controller).to receive(:get_hosts_to_scaledown_from_ids).and_return([@host1])
      post :scaledown, :params => {:id => @ems.id, :scaledown => "",
           :orchestration_stack_id => @orchestration_stack.id, :host_ids => [@host1.id]}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include(
        "Not all hosts can be removed from the deployment."
      )
    end

    it "when values are changed, selected host is in correct state" do
      expect(@orchestration_stack).to receive(:scale_down_queue)
      post :scaledown, :params => {:id => @ems.id, :scaledown => "",
                                   :orchestration_stack_id => @orchestration_stack.id, :host_ids => [@host2.id]}
      expect(controller.send(:flash_errors?)).to be_falsey
      expect(response.body).to include("redirected")
      expect(response.body).to include("ems_infra")
      expect(session[:flash_msgs]).to match [a_hash_including(:message => " Scaling down to 1 compute nodes", :level => :success)]
    end

    it "when no orchestration stack is available" do
      @ems = FactoryBot.create(:ems_openstack_infra)
      allow(controller).to receive(:get_infra_provider).and_return(@ems)
      post :scaledown, :params => {:id => @ems.id, :scaledown => "", :orchestration_stack_id => nil}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Orchestration stack could not be found.")
    end
  end

  describe "#register_and_configure_nodes" do
    before do
      stub_user(:features => :all)
      @ems = FactoryBot.create(:ems_openstack_infra_with_stack_and_compute_nodes)
      allow_any_instance_of(ManageIQ::Providers::Openstack::InfraManager)
        .to receive(:openstack_handle).and_return([])
      allow_any_instance_of(EmsInfraController)
        .to receive(:parse_json).and_return("{\"nodes\": []}")
      @nodes_example = {:file => "dummy"}
    end

    it "when success expected" do
      allow_any_instance_of(ManageIQ::Providers::Openstack::InfraManager)
        .to receive(:workflow_service).and_return([])
      allow_any_instance_of(ManageIQ::Providers::Openstack::InfraManager)
        .to receive(:register_and_configure_nodes).and_return("SUCCESS")
      post :register_nodes, :params => {:id => @ems.id, :nodes_json => @nodes_example, :register => 1}
      expect(controller.send(:flash_errors?)).to be_falsey
      expect(response.body).to include("redirected")
      expect(response.body).to include("ems_infra")
    end

    it "when failure expected, workflow service not reachable" do
      post :register_nodes, :params => {:id => @ems.id, :nodes_json => @nodes_example, :register => 1}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      message = "Cannot connect to workflow service"
      expect(flash_messages.first[:message]).to include(message)
    end

    it "when failure expected, workflow cannot be executed" do
      allow_any_instance_of(ManageIQ::Providers::Openstack::InfraManager)
        .to receive(:workflow_service).and_return([])
      post :register_nodes, :params => {:id => @ems.id, :nodes_json => @nodes_example, :register => 1}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      message = "Error executing register and configure workflows"
      expect(flash_messages.first[:message]).to include(message)
    end

    it "when failure expected, node_json file is not selected" do
      post :register_nodes, :params => {:id => @ems.id, :register => 1}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      message = "Please select a JSON file containing the nodes you would like to register."
      expect(flash_messages.first[:message]).to include(message)
    end
  end

  describe "#show" do
    render_views

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user, :features => "none")
      @ems = FactoryBot.create(:ems_vmware)
    end

    let(:url_params) { {} }

    subject { get :show, :params => {:id => @ems.id}.merge(url_params) }

    context "display=hosts" do
      it 'renders custom buttons for hosts accessed from relationship screen' do
        custom_button = FactoryBot.create(
          :custom_button, :name => "My Button", :applies_to_class => "Host",
          :visibility => {:roles => ["_ALL_"]},
          :options => {:display => true, :open_url => false, :display_for => "both"}
        )
        custom_button_set = FactoryBot.create(
          :custom_button_set, :set_data => {
            :applies_to_class => "Host", :button_order => [custom_button.id]
          }
        )
        custom_button_set.add_member(custom_button)
        controller.instance_variable_set(:@record, @ems)
        allow(controller).to receive(:controller).and_return(controller)

        # format js to avoid redirection (application_controller/explorer.rb#generic_x_show)
        get :show, :params => {:id => @ems.id, :display => 'hosts', :format => :js}

        toolbar = controller.send(:toolbar_from_hash)
        toolbar_custom_button = toolbar.select do |button_group|
          button_group&.map do |button|
            button if button[:id].starts_with?("custom_")
          end&.compact.present?
        end.flatten.first

        expect(toolbar_custom_button).not_to be_nil
        expect(toolbar_custom_button[:items].count).to eql(1)
        expect(response.status).to eq(200)
      end
    end

    context "display=timeline" do
      let(:url_params) { {:display => 'timeline'} }

      it do
        bypass_rescue
        is_expected.to have_http_status 200
      end

      it 'timeline toolbar is selected' do
        expect(ApplicationHelper::Toolbar::TimelineCenter).to receive(:definition).and_call_original
        subject
      end

      it "contains timelines title" do
        subject
        expect(response.body).to include("Timelines for #{ui_lookup(:table => controller.controller_name)} &quot;#{@ems.name}&quot;")
      end
    end

    context "render listnav partial" do
      render_views

      it "listnav correctly for summary page" do
        is_expected.to have_http_status 200
        is_expected.not_to render_template(:partial => "layouts/listnav/_ems_infra")
      end

      it "listnav correctly for timeline" do
        get :show, :params => { :id => @ems.id, :display => 'timeline' }
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "layouts/listnav/_ems_infra")
      end
    end

    it "shows associated datastores" do
      @datastore = FactoryBot.create(:storage, :name => 'storage_name')
      @datastore.parent = @ems
      controller.instance_variable_set(:@breadcrumbs, [])
      get :show, :params => {:id => @ems.id, :display => 'storages'}
      expect(response.status).to eq(200)
      expect(response).to render_template('shared/views/ems_common/show')
      expect(assigns(:breadcrumbs)).to eq([{:name => "Infrastructure Providers", :url => "/ems_infra/show_list"},
                                           {:name => "#{@ems.name} (All Datastores)", :url => "/ems_infra/#{@ems.id}?display=storages"}])

      # display needs to be saved to session for GTL pagination and such
      expect(session[:ems_infra_display]).to eq('storages')
    end

    it " can tag associated datastores" do
      stub_user(:features => :all)
      datastore = FactoryBot.create(:storage, :name => 'storage_name')
      datastore.parent = @ems
      controller.instance_variable_set(:@_orig_action, "x_history")
      get :show, :params => {:id => @ems.id, :display => 'storages'}
      post :button, :params => {:id => @ems.id, :display => 'storages', :miq_grid_checks => datastore.id, :pressed => "storage_tag", :format => :js}
      expect(response.status).to eq(200)
      _breadcrumbs = controller.instance_variable_get(:@breadcrumbs)
      expect(assigns(:breadcrumbs)).to eq([{:name => "Infrastructure Providers", :url => "/ems_infra/show_list"},
                                           {:name => "#{@ems.name} (All Datastores)",
                                            :url  => "/ems_infra/#{@ems.id}?display=storages"},
                                           {:name => "Tag Assignment", :url => "//tagging_edit"}])
    end

    context "render dashboard" do
      subject { get :show, :params => { :id => @ems.id, :display => 'dashboard' } }
      render_views

      it 'never render template show' do
        is_expected.not_to render_template('shared/views/ems_common/show')
      end

      it 'never render listnav' do
        is_expected.not_to render_template(:partial => "layouts/listnav/_ems_container")
      end

      it 'uses its own template' do
        is_expected.to have_http_status 200
        is_expected.not_to render_template(:partial => "ems_container/show_dashboard")
      end
    end
  end

  describe "#show_list" do
    before do
      stub_user(:features => :all)
      FactoryBot.create(:ems_vmware)
      get :show_list
    end

    it { expect(response.status).to eq(200) }
  end

  context "breadcrumbs path on a 'show' page of an Infrastructure Provider accessed from Dashboard maintab" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    context "when previous breadcrumbs path contained 'Cloud Providers'" do
      it "shows 'Infrastructure Providers -> (Summary)' breadcrumb path" do
        ems = FactoryBot.create(:ems_vmware)
        get :show, :params => { :id => ems.id }
        breadcrumbs = controller.instance_variable_get(:@breadcrumbs)
        expect(breadcrumbs).to eq([{:name => "Infrastructure Providers", :url => "/ems_infra/show_list"},
                                   {:name => "#{ems.name} (Dashboard)", :url => "/ems_infra/#{ems.id}"}])
      end
    end
  end

  describe "#build_credentials" do
    before { @ems = FactoryBot.create(:ems_openstack_infra) }

    context "#build_credentials only contains credentials that it supports and has a username for in params" do
      let(:default_creds) { {:userid => "default_userid", :password => "default_password"} }
      let(:amqp_creds)    { {:userid => "amqp_userid",    :password => "amqp_password"} }
      let(:ssh_keypair_creds) { {:userid => "ssh_keypair_userid", :auth_key => "ssh_keypair_password"} }

      it "uses the passwords from params for validation if they exist" do
        controller.params = {:default_userid       => default_creds[:userid],
                             :default_password     => default_creds[:password],
                             :amqp_userid          => amqp_creds[:userid],
                             :amqp_password        => amqp_creds[:password],
                             :ssh_keypair_userid   => ssh_keypair_creds[:userid],
                             :ssh_keypair_password => ssh_keypair_creds[:auth_key]}
        expect(@ems).to receive(:supports_authentication?).with(:amqp).and_return(true)
        expect(@ems).to receive(:supports_authentication?).with(:ssh_keypair).and_return(true)
        expect(@ems).to receive(:supports_authentication?).with(:oauth)
        expect(@ems).to receive(:supports_authentication?).with(:auth_key)
        expect(controller.send(:build_credentials, @ems, :validate)).to eq(:default     => default_creds.merge!(:save => false),
                                                                           :amqp        => amqp_creds.merge!(:save => false),
                                                                           :ssh_keypair => ssh_keypair_creds.merge!(:save => false))
      end

      it "uses the stored passwords for validation if passwords dont exist in params" do
        controller.params = {:default_userid     => default_creds[:userid],
                             :amqp_userid        => amqp_creds[:userid],
                             :ssh_keypair_userid => ssh_keypair_creds[:userid]}
        expect(@ems).to receive(:authentication_password).and_return(default_creds[:password])
        expect(@ems).to receive(:authentication_password).with(:amqp).and_return(amqp_creds[:password])
        expect(@ems).to receive(:supports_authentication?).with(:amqp).and_return(true)
        expect(@ems).to receive(:authentication_key).with(:ssh_keypair).and_return(ssh_keypair_creds[:auth_key])
        expect(@ems).to receive(:supports_authentication?).with(:ssh_keypair).and_return(true)
        expect(@ems).to receive(:supports_authentication?).with(:oauth)
        expect(@ems).to receive(:supports_authentication?).with(:auth_key)
        expect(controller.send(:build_credentials, @ems, :validate)).to eq(:default     => default_creds.merge!(:save => false),
                                                                           :amqp        => amqp_creds.merge!(:save => false),
                                                                           :ssh_keypair => ssh_keypair_creds.merge!(:save => false))
      end
    end
  end

  context "SCVMM - create, update, validate, cancel" do
    before { login_as FactoryBot.create(:user, :features => %w[ems_infra_new ems_infra_edit]) }

    render_views

    it 'creates on post' do
      expect do
        post :create, :params => {
          "button"                    => "add",
          "name"                      => "foo",
          "emstype"                   => "scvmm",
          "zone"                      => zone.name,
          "cred_type"                 => "default",
          "default_hostname"          => "foo.com",
          "default_security_protocol" => "ssl",
          "default_userid"            => "foo",
          "default_password"          => "[FILTERED]",
        }
      end.to change { ManageIQ::Providers::Microsoft::InfraManager.count }.by(1)
    end

    it 'creates and updates an authentication record on post' do
      expect do
        post :create, :params => {
          "button"                    => "add",
          "name"                      => "foo_scvmm",
          "emstype"                   => "scvmm",
          "zone"                      => zone.name,
          "cred_type"                 => "default",
          "default_hostname"          => "foo.com",
          "default_security_protocol" => "ssl",
          "default_userid"            => "foo",
          "default_password"          => "[FILTERED]",
        }
      end.to change { Authentication.count }.by(1)

      expect(response.status).to eq(200)
      scvmm = ManageIQ::Providers::Microsoft::InfraManager.where(:name => "foo_scvmm").first
      expect(scvmm.authentications.size).to eq(1)

      expect do
        post :update, :params => {
          "id"               => scvmm.id,
          "button"           => "save",
          "default_hostname" => "host_scvmm_updated",
          "name"             => "foo_scvmm",
          "emstype"          => "scvmm",
          "default_userid"   => "bar",
          "default_password" => "[FILTERED]",
        }
      end.not_to change { Authentication.count }

      expect(response.status).to eq(200)
      expect(scvmm.authentications.first).to have_attributes(:userid => "bar", :password => "[FILTERED]")
    end

    it "validates credentials for a new record" do
      expect(ManageIQ::Providers::Microsoft::InfraManager).to receive(:build_connect_params)
      expect(ManageIQ::Providers::Microsoft::InfraManager).to receive(:validate_credentials_task)

      post :create, :params => {
        "button"           => "validate",
        "cred_type"        => "default",
        "name"             => "foo_scvmm",
        "emstype"          => "scvmm",
        "zone"             => zone.name,
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
      }

      expect(response.status).to eq(200)
    end

    it "cancels a new record" do
      post :create, :params => {
        "button"           => "cancel",
        "cred_type"        => "default",
        "name"             => "foo_scvmm",
        "emstype"          => "scvmm",
        "zone"             => zone.name,
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
      }

      expect(response.status).to eq(200)
    end
  end

  context "Openstack - create, update" do
    before { login_as FactoryBot.create(:user, :features => %w[ems_infra_new ems_infra_edit]) }

    render_views

    it 'creates on post' do
      expect do
        post :create, :params => {
          "button"                        => "add",
          "name"                          => "foo",
          "emstype"                       => "openstack_infra",
          "zone"                          => zone.name,
          "cred_type"                     => "default",
          "default_hostname"              => "foo.com",
          "default_api_port"              => "5000",
          "default_security_protocol"     => "ssl",
          "default_userid"                => "foo",
          "default_password"              => "[FILTERED]",
          "amqp_hostname"                 => "foo_amqp.com",
          "amqp_api_port"                 => "5672",
          "amqp_security_protocol"        => "ssl",
          "amqp_userid"                   => "amqp_foo",
          "amqp_password"                 => "[FILTERED]",
          "ssh_keypair_hostname"          => "foo_ssh.com",
          "ssh_keypair_port"              => "5372",
          "ssh_keypair_security_protocol" => "ssl",
          "ssh_keypair_userid"            => "ssh_foo",
          "ssh_keypair_password"          => "[FILTERED]",
        }
      end.to change { ManageIQ::Providers::Openstack::InfraManager.count }.by(1)
    end

    it 'creates and updates an authentication record on post' do
      expect do
        post :create, :params => {
          "button"                        => "add",
          "name"                          => "foo_openstack",
          "emstype"                       => "openstack_infra",
          "zone"                          => zone.name,
          "cred_type"                     => "default",
          "default_hostname"              => "foo.com",
          "default_api_port"              => "5000",
          "default_security_protocol"     => "ssl",
          "default_userid"                => "foo",
          "default_password"              => "[FILTERED]",
          "amqp_hostname"                 => "foo_amqp.com",
          "amqp_api_port"                 => "5672",
          "amqp_security_protocol"        => "ssl",
          "amqp_userid"                   => "amqp_foo",
          "amqp_password"                 => "[FILTERED]",
          "ssh_keypair_hostname"          => "foo_ssh.com",
          "ssh_keypair_port"              => "5372",
          "ssh_keypair_security_protocol" => "ssl",
          "ssh_keypair_userid"            => "ssh_foo",
          "ssh_keypair_password"          => "[FILTERED]",
        }
      end.to change { Authentication.count }.by(3)

      expect(response.status).to eq(200)
      openstack = ManageIQ::Providers::Openstack::InfraManager.where(:name => "foo_openstack").first
      expect(openstack.authentications.size).to eq(3)

      expect do
        post :update, :params => {
          "id"               => openstack.id,
          "button"           => "save",
          "default_hostname" => "host_openstack_updated",
          "name"             => "foo_openstack",
          "emstype"          => "openstack_infra",
          "default_userid"   => "bar",
          "default_password" => "[FILTERED]",
        }
      end.not_to change { Authentication.count }

      expect(response.status).to eq(200)
      expect(openstack.authentications.first).to have_attributes(:userid => "bar", :password => "[FILTERED]")
    end
  end

  context "Redhat - create, update" do
    before do
      login_as FactoryBot.create(:user, :features => %w(ems_infra_new ems_infra_edit))
      allow_any_instance_of(ManageIQ::Providers::Redhat::InfraManager)
        .to receive(:supported_api_versions).and_return([3, 4])
    end

    render_views

    let(:creation_params) do
      {
        "button"                => "add",
        "name"                  => "foo_rhevm",
        "emstype"               => "rhevm",
        "zone"                  => zone.name,
        "cred_type"             => "default",
        "default_hostname"      => "foo.com",
        "default_api_port"      => "5000",
        "default_userid"        => "foo",
        "default_password"      => "[FILTERED]",
        "metrics_hostname"      => "foo_metrics.com",
        "metrics_api_port"      => "5672",
        "metrics_userid"        => "metrics_foo",
        "metrics_password"      => "[FILTERED]",
        "metrics_database_name" => "metrics_dwh"
      }
    end

    subject(:create) { post :create, :params => creation_params }

    it 'creates on post' do
      expect do
        create
      end.to change { ManageIQ::Providers::Redhat::InfraManager.where("name" => creation_params["name"]).count }.by(1)
    end

    it 'creates authentication records on post' do
      expect do
        create
      end.to change { Authentication.count }.by(2)

      expect(response.status).to eq(200)
      rhevm = ManageIQ::Providers::Redhat::InfraManager.where(:name => "foo_rhevm").first
      expect(rhevm.authentications.size).to eq(2)
    end

    it 'updates authentication records on post' do
      create
      rhevm = ManageIQ::Providers::Redhat::InfraManager.where(:name => "foo_rhevm").first
      expect do
        post :update, :params => {
          "id"               => rhevm.id,
          "button"           => "save",
          "default_hostname" => "host_rhevm_updated",
          "name"             => "foo_rhevm",
          "emstype"          => "rhevm",
          "default_userid"   => "bar",
          "default_password" => "[FILTERED]",
        }
      end.not_to change { Authentication.count }

      expect(response.status).to eq(200)
      expect(rhevm.authentications.first).to have_attributes(:userid => "bar", :password => "[FILTERED]")
    end

    context "Metrics endpoint" do
      it 'creates endpoints records on post' do
        create
        expect(response.status).to eq(200)
        rhevm = ManageIQ::Providers::Redhat::InfraManager.where(:name => "foo_rhevm").first
        expect(rhevm.endpoints.size).to eq(3)
      end

      it 'updates metrics endpoint records on post when button is "save"' do
        create
        rhevm = ManageIQ::Providers::Redhat::InfraManager.where(:name => "foo_rhevm").first

        updated_metrics_params = { "default_hostname"      => "default.hostname.example.com",
                                   "metrics_hostname"      => "foo_metrics.com",
                                   "metrics_api_port"      => "5672",
                                   "metrics_userid"        => "metrics_foo",
                                   "metrics_password"      => "[FILTERED]",
                                   "metrics_database_name" => "metrics_dwh_updated"}

        expect do
          post :update, :params => { "id" => rhevm.id, :button => 'save' }.merge(updated_metrics_params)
        end.not_to change { Endpoint.count }

        expect(Endpoint.where(:path => updated_metrics_params["metrics_database_name"]).count)
          .to eq(1)
      end

      it 'tries to varify with the right params on post when button is "validate"' do
        create
        rhevm = ManageIQ::Providers::Redhat::InfraManager.where(:name => "foo_rhevm").first
        expect_any_instance_of(ManageIQ::Providers::Redhat::InfraManager).to receive(:authentication_check)
          .with("metrics",
                hash_including(:save => false, :database => creation_params["metrics_database_name"]))
        post :update, :params => creation_params.merge(:button => "validate", :cred_type => "metrics", :id => rhevm.id)
      end
    end
  end

  context "Kubevirt - update" do
    before { login_as FactoryBot.create(:user, :features => %w[ems_infra_new ems_infra_edit]) }

    render_views

    it 'creates ems container with virtualization endpoint on post' do
      expect do
        post :create, :params => {
          "button"                     => "add",
          "cred_type"                  => "kubevirt",
          "name"                       => "openshift_with_kubevirt",
          "emstype"                    => "openshift",
          "zone"                       => 'default',
          "default_security_protocol"  => "ssl-without-validation",
          "default_hostname"           => "server.example.com",
          "default_api_port"           => "5000",
          "default_userid"             => "",
          "default_password"           => "",
          "provider_region"            => "",
          "virtualization_selection"   => "kubevirt",
          "kubevirt_security_protocol" => "ssl-without-validation",
          "kubevirt_hostname"          => "server.example.com",
          "kubevirt_api_port"          => "5000",
        }
      end.to change { ManageIQ::Providers::Kubevirt::InfraManager.count }.by(1)
    end

    it 'creates and updates an authentication record on post' do
      expect do
        post :create, :params => {
          "button"                     => "add",
          "cred_type"                  => "kubevirt",
          "name"                       => "openshift_with_kubevirt",
          "emstype"                    => "openshift",
          "zone"                       => 'default',
          "default_security_protocol"  => "ssl-without-validation",
          "default_hostname"           => "server.example.com",
          "default_api_port"           => "5000",
          "default_userid"             => "",
          "default_password"           => "",
          "provider_region"            => "",
          "virtualization_selection"   => "kubevirt",
          "kubevirt_security_protocol" => "ssl-without-validation",
          "kubevirt_hostname"          => "server.example.com",
          "kubevirt_api_port"          => "5000",
          "kubevirt_password"          => "[FILTERED]"
        }
      end.to change { ManageIQ::Providers::Kubevirt::InfraManager.count }.by(1)

      expect(response.status).to eq(200)
      kubevirt = ManageIQ::Providers::Kubevirt::InfraManager.where(:name => "openshift_with_kubevirt Virtualization Manager").first
      expect(kubevirt.authentications.size).to eq(2)
      expect(kubevirt.authentication_token(:kubevirt)).to eq('[FILTERED]')

      expect do
        post :update, :params => {
          "id"                => kubevirt.id,
          "button"            => "save",
          "name"              => "foo_kubevirt_name_changed",
          "emstype"           => "kubevirt",
          "cred_type"         => "kubevirt",
          "kubevirt_password" => "XXXXXX",
        }
      end.not_to change { Authentication.count }

      expect(response.status).to eq(200)

      kubevirt.reload
      expect(kubevirt.name).to eq('foo_kubevirt_name_changed')
      expect(kubevirt.authentication_token(:kubevirt)).to eq('XXXXXX')
    end
  end

  context "VMWare - create, update" do
    before { login_as FactoryBot.create(:user, :features => %w[ems_infra_new ems_infra_edit]) }

    render_views

    it 'creates on post' do
      expect do
        post :create, :params => {
          "button"           => "add",
          "name"             => "foo",
          "emstype"          => "vmwarews",
          "zone"             => zone.name,
          "cred_type"        => "default",
          "default_hostname" => "foo.com",
          "default_userid"   => "foo",
          "default_password" => "[FILTERED]",
        }
      end.to change { ManageIQ::Providers::Vmware::InfraManager.count }.by(1)
    end

    it 'creates and updates an authentication record on post' do
      expect do
        post :create, :params => {
          "button"           => "add",
          "name"             => "foo_vmware",
          "emstype"          => "vmwarews",
          "zone"             => zone.name,
          "cred_type"        => "default",
          "default_hostname" => "foo.com",
          "default_userid"   => "foo",
          "default_password" => "[FILTERED]",
        }
      end.to change { Authentication.count }.by(1)

      expect(response.status).to eq(200)
      vmware = ManageIQ::Providers::Vmware::InfraManager.where(:name => "foo_vmware").first
      expect(vmware.authentications.size).to eq(1)

      expect do
        post :update, :params => {
          "id"               => vmware.id,
          "button"           => "save",
          "default_hostname" => "host_vmware_updated",
          "name"             => "foo_vmware",
          "emstype"          => "vmwarews",
          "default_userid"   => "bar",
          "default_password" => "[FILTERED]",
        }
      end.not_to change { Authentication.count }

      expect(response.status).to eq(200)
      expect(vmware.authentications.first).to have_attributes(:userid => "bar", :password => "[FILTERED]")
    end
  end

  include_examples '#download_summary_pdf', :ems_vmware

  it_behaves_like "controller with custom buttons"

  context "hiding tenant column for non admin user" do
    before do
      Tenant.seed
      EvmSpecHelper.local_miq_server
    end

    let!(:record) { FactoryBot.create(:ems_infra, :tenant => Tenant.root_tenant) }

    let(:report) do
      FactoryGirl.create(:miq_report,
                         :name        => 'Infrastructure Providers',
                         :db          => 'EmsInfra',
                         :title       => 'Infrastructure Providers',
                         :cols        => %w[name hostname],
                         :col_order   => %w[name hostname tenant.name],
                         :headers     => %w[Name Hostname Tenant],
                         :col_options => {"tenant.name" => {:display_method => :user_super_admin?}},
                         :include     => {"tenant" => {"columns" => ['name']}})
    end

    include_examples 'hiding tenant column for non admin user', :name => "Name", :hostname => "Hostname"
  end
end
