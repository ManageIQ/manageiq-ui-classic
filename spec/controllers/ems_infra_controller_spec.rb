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

    context "renders views" do
      render_views

      it "renders show" do
        is_expected.to have_http_status 200
      end

      it "listnav correctly for timeline" do
        get :show, :params => { :id => @ems.id, :display => 'timeline' }
        expect(response.status).to eq(200)
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
