describe VmInfraController do
  let(:host_1x1)  { FactoryGirl.create(:host_vmware_esx, :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB)) }
  let(:host_2x2)  { FactoryGirl.create(:host_vmware_esx, :hardware => FactoryGirl.create(:hardware, :cpu2x2, :ram1GB)) }
  let(:vm_vmware) { FactoryGirl.create(:vm_vmware) }
  before do
    stub_user(:features => :all)

    session[:settings] = {:views => {:treesize => 20}}

    allow(controller).to receive(:protect_build_tree).and_return(nil)
    controller.instance_variable_set(:@protect_tree, OpenStruct.new(:name => "name"))

    MiqRegion.seed
    EvmSpecHelper.create_guid_miq_server_zone
  end

  render_views

  it 'can render the explorer' do
    expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
      :model_name                     => 'VmOrTemplate',
      :report_data_additional_options => {
        :model      => "VmOrTemplate",
        :lastaction => 'show_list'
      }
    )

    get :explorer
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end

  # http://localhost:3000/vm_infra/show/10000000001403?display=vmtree_info
  it 'can render the genealogy tree' do
    ApplicationController.handle_exceptions = true

    seed_session_trees('vm_infra', 'vms_instances_filter_tree')
    post :show, :params => {:id => vm_vmware.id, :display => 'vmtree_info'}, :xhr => true
    expect(response.status).to eq(200)
    expect(response).to render_template('vm_common/_vmtree')
  end

  # http://localhost:3000/vm_infra/show/10000000000449
  it 'can open a VM and select it in the left tree' do
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer

    expect(response).to render_template('shared/summary/_textual_tags')
    expect(response.body).to match(/VM and Instance &quot;#{vm_vmware.name}&quot;/)

    expect(response.status).to eq(200)
  end

  let(:custom_attr1) do
    FactoryGirl.create(
      :custom_attribute,
      :resource => vm_vmware,
      :name     => 'Proč by si jeden nepokrad',
      :value    => 'jó, v tom je Pepa demokrat'
    )
  end

  let(:custom_attr2) do
    FactoryGirl.create(
      :custom_attribute,
      :resource => vm_vmware,
      :name     => nil,
      :value    => 'a šikulovi má být dána šance'
    )
  end

  # http://localhost:3000/vm_infra/show/10000000000449
  it 'can display VM details for vm with ems_custom_attributes and a null attribute name' do
    vm_vmware.ems_custom_attributes.push(custom_attr1, custom_attr2)
    expect(controller).to receive(:identify_record).and_return(vm_vmware)

    get :show, :params => { :id => vm_vmware.id }
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer

    expect(response.body).to match(/VC Custom Attributes/)
    expect(response.body).to match(custom_attr1.name)
    expect(response.body).to match(custom_attr1.value)
    expect(response.body).to match(custom_attr2.value)

    expect(response.status).to eq(200)
  end

  it 'can render the snapshot info' do
    ApplicationController.handle_exceptions = true
    seed_session_trees('vm_infra', 'vms_instances_filter_tree')
    post :show, :params => {:id => vm_vmware.id, :display => 'snapshot_info'}, :xhr => true
    expect(response.status).to eq(200)
    expect(response).to render_template('vm_common/_snapshots_desc')
    expect(response).to render_template('vm_common/_snapshots_tree')
  end

  it 'can open the right size tab' do
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_right_size', :id => vm_vmware.id}
    expect(response.status).to eq(200)
  end

  it 'can open the reconfigure tab' do
    vm = FactoryGirl.create(:vm_vmware, :host => host_1x1, :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => '04'))
    allow(controller).to receive(:x_node).and_return("v-#{vm.id}")

    get :show, :params => {:id => vm.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_reconfigure', :id => vm.id}
    expect(response.status).to eq(200)
  end

  it 'can open VM edit tab' do
    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_protect', :id => vm_vmware.id}
    expect(response.status).to eq(200)

    allow(controller).to receive(:x_node).and_return("v-#{vm_vmware.id}")

    post :x_button, :params => {:pressed => 'vm_edit', :id => vm_vmware.id}
    expect(response.status).to eq(200)
    expect(response).to render_template(:partial => 'vm_common/_form')
  end

  it 'can open VM Ownership tab' do
    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_protect', :id => vm_vmware.id}
    expect(response.status).to eq(200)

    allow(controller).to receive(:x_node).and_return("v-#{vm_vmware.id}")

    post :x_button, :params => {:pressed => 'vm_ownership', :id => vm_vmware.id}
    expect(response.status).to eq(200)
    expect(response).to render_template(:partial => 'shared/views/_ownership')
  end

  it 'can Extract Running Processes form VM' do
    post :x_button, :params => {:pressed => 'vm_collect_running_processes', :id => vm_vmware.id}
    expect(response.status).to eq(200)
  end

  it 'can open VM Compare tab' do
    vm = FactoryGirl.create(:vm_vmware,
                            :host     => host_1x1,
                            :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => '04'))
    vm2 = FactoryGirl.create(:vm_vmware,
                             :host     => host_1x1,
                             :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => '05'))
    FactoryGirl.create(:miq_report, :filename      => 'vms.yaml',
                                    :template_type => 'compare',
                                    :name          => "Test Report",
                                    :rpt_type      => "Custom",
                                    :tz            => "Eastern Time (US & canada)",
                                    :headers       => ["Name", "Boot time", "Disks aligned"],
                                    :col_order     => %w(name boot_time disks_aligned),
                                    :cols          => %w(name boot_time disks_aligned))

    allow(controller).to receive(:x_node).and_return("v-#{vm.id}")

    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')
    post :explorer
    expect(response.status).to eq(200)

    controller.instance_variable_set(:@settings, :views => {:compare => "compressed"})
    controller.instance_variable_set(:@export_reports, [])
    post :x_button, :params => {
      :pressed          => 'vm_compare',
      "check_#{vm.id}"  => "1",
      "check_#{vm2.id}" => "1",
      "type"            => "compressed"
    }
    expect(response.status).to eq(200)
    expect(response).to render_template(:partial => 'layouts/_compare')
  end

  it 'can Perform VM Smart State Analysis' do
    post :x_button, :params => {:pressed => 'vm_scan', :id => vm_vmware.id}
    expect(response.status).to eq(200)
  end

  it 'can Refresh Relationships and Power Status VM Smart State Analysis' do
    post :x_button, :params => {:pressed => 'vm_refresh', :id => vm_vmware.id}
    expect(response.status).to eq(200)
  end

  it 'can open Manage Policies' do
    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_protect', :id => vm_vmware.id}
    expect(response.status).to eq(200)
  end

  it 'can cancel Manage Policies' do
    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_protect', :id => vm_vmware.id}
    expect(response.status).to eq(200)

    controller.instance_variable_set(:@in_a_form, nil)
    post :protect, :params => {:button => 'cancel'}

    expect(response.body).to include("Edit policy assignments was cancelled by the user")
  end

  it 'can open Policies Simulation' do
    vm = FactoryGirl.create(:vm_vmware,
                            :host     => host_1x1,
                            :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => '04'))
    allow(controller).to receive(:x_node).and_return("v-#{vm.id}")

    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_policy_sim', :id => vm.id}
    expect(response.status).to eq(200)
    expect(response).to render_template(:partial => 'layouts/_policy_sim')
  end

  it 'can open Edit Tags' do
    classification = FactoryGirl.create(:classification, :name => "department", :description => "D    epartment")
    @tag1 = FactoryGirl.create(:classification_tag,
                               :name   => "tag1",
                               :parent => classification)
    @tag2 = FactoryGirl.create(:classification_tag,
                               :name   => "tag2",
                               :parent => classification)
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_tag', :id => vm_vmware.id}
    expect(response.status).to eq(200)
    expect(response).to render_template(:partial => 'layouts/_tagging')
  end

  it 'The VM quadicons on the tagging screen do not links' do
    classification = FactoryGirl.create(:classification, :name => "department", :description => "D    epartment")
    @tag1 = FactoryGirl.create(:classification_tag,
                               :name   => "tag1",
                               :parent => classification)
    @tag2 = FactoryGirl.create(:classification_tag,
                               :name   => "tag2",
                               :parent => classification)
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_tag', :id => vm_vmware.id}
    expect(response.status).to eq(200)
    expect(response.body).to_not include('/vm_infra/x_button')
  end

  it 'can Check VM Compliance' do
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_check_compliance', :id => vm_vmware.id}
    expect(response.status).to eq(200)
  end

  it 'can provision VMs' do
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_miq_request_new', :id => vm_vmware.id}
    expect(response.status).to eq(200)
    expect(response).to render_template(:partial => 'miq_request/_pre_prov')
  end

  it 'can set retirement date' do
    allow_any_instance_of(Vm).to receive(:supports_retire?).and_return(true)
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_retire', :id => vm_vmware.id}
    expect(response.status).to eq(200)
    expect(response).to render_template(:partial => 'shared/views/_retire')
  end

  it 'can retire selected items' do
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    expect(controller).to receive(:render).at_least(:once)
    post :x_button, :params => {:pressed => 'vm_retire_now', :id => vm_vmware.id}
    expect(response).to render_template(:partial => 'layouts/_flash_msg')
  end

  it 'can reset selected items' do
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_reset', :id => vm_vmware.id}
    expect(response.status).to eq(200)
  end

  it 'can migrate selected items' do
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_migrate', :id => vm_vmware.id}
    expect(response).to render_template('layouts/_x_edit_buttons')
    expect(response.status).to eq(200)
  end

  it 'can Publish selected VM' do
    vm = FactoryGirl.create(:vm_vmware,
                            :host     => host_1x1,
                            :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => '04'))
    allow(controller).to receive(:x_node).and_return("v-#{vm.id}")

    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_publish', :id => vm.id}
    expect(response.status).to eq(200)
  end

  it 'can clone selected VM' do
    get :show, :params => {:id => vm_vmware.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_clone', :id => vm_vmware.id}
    expect(response.status).to eq(200)
  end

  context 'transform VM dialog' do
    let(:dialog)           { FactoryGirl.create(:dialog, :label => 'Transform VM', :buttons => 'submit') }
    let!(:resource_action) { FactoryGirl.create(:resource_action, :dialog => dialog) }

    it 'can Transform selected VM' do
      get :show, :params => {:id => vm_vmware.id}
      expect(response).to redirect_to(:action => 'explorer')

      post :explorer
      expect(response.status).to eq(200)

      post :x_button, :params => {:pressed => 'vm_transform', :id => vm_vmware.id}
      expect(response.status).to eq(200)
    end
  end

  it 'can Shutdown Guest' do
    post :x_button, :params => {:pressed => 'vm_guest_shutdown', :id => vm_vmware.id}
    expect(response.status).to eq(200)

    expect(response.body).to include('Shutdown Guest initiated for 1 VM and Instance from the %{product} Database' % {:product => Vmdb::Appliance.PRODUCT_NAME})
  end

  it 'can Restart Guest' do
    post :x_button, :params => {:pressed => 'vm_guest_restart', :id => vm_vmware.id}
    expect(response.status).to eq(200)

    expect(response.body).to include('Restart Guest initiated for 1 VM and Instance from the %{product} Database' % {:product => Vmdb::Appliance.PRODUCT_NAME})
  end

  it 'can Power On VM' do
    post :x_button, :params => {:pressed => 'vm_start', :id => vm_vmware.id}
    expect(response.status).to eq(200)

    expect(response.body).to include('Start initiated for 1 VM and Instance from the %{product} Database' % {:product => Vmdb::Appliance.PRODUCT_NAME})
  end

  it 'can Power Off VM' do
    post :x_button, :params => {:pressed => 'vm_stop', :id => vm_vmware.id}
    expect(response.status).to eq(200)

    expect(response.body).to include('Stop initiated for 1 VM and Instance from the %{product} Database' % {:product => Vmdb::Appliance.PRODUCT_NAME})
  end

  it 'can Suspend VM' do
    post :x_button, :params => {:pressed => 'vm_suspend', :id => vm_vmware.id}
    expect(response.status).to eq(200)

    expect(response.body).to include('Suspend initiated for 1 VM and Instance from the %{product} Database' % {:product => Vmdb::Appliance.PRODUCT_NAME})
  end

  it 'can Reset VM' do
    expect(vm_vmware).to receive(:supports_control?).and_return(true)
    expect(vm_vmware).to receive(:current_state).and_return("on")
    expect(VmOrTemplate).to receive(:find).with([vm_vmware.id.to_s]).and_return([vm_vmware])

    post :x_button, :params => {:pressed => 'vm_reset', :id => vm_vmware.id}
    expect(response.status).to eq(200)

    expect(response.body).to include('Reset initiated for 1 VM and Instance from the %{product} Database' % {:product => Vmdb::Appliance.PRODUCT_NAME})
  end

  it 'can run Utilization' do
    post :x_button, :params => {:display => "performance",  :pressed => 'vm_perf', :id => vm_vmware.id}
    expect(response.status).to eq(200)
  end

  it 'the reconfigure tab for a vm with max_cpu_cores_per_socket <= 1 should not display the cpu_cores_per_socket dropdown' do
    vm = FactoryGirl.create(:vm_vmware,
                            :host     => host_1x1,
                            :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => '04'))
    allow(controller).to receive(:x_node).and_return("v-#{vm.id}")

    get :show, :params => {:id => vm.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_reconfigure', :id => vm.id}
    expect(response.status).to eq(200)
    expect(response.body).to_not include('Total Processors')
  end

  it 'the reconfigure tab for a vm with max_cpu_cores_per_socket > 1 should display the cpu_cores_per_socket dropdown' do
    vm = FactoryGirl.create(:vm_vmware,
                            :host     => host_2x2,
                            :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => "07"))
    allow(controller).to receive(:x_node).and_return("v-#{vm.id}")

    get :show, :params => {:id => vm.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_reconfigure', :id => vm.id}
    expect(response.status).to eq(200)
    expect(response.body).to include('Total Processors')
  end

  it 'the reconfigure tab for a single vmware vm should display the list of disks' do
    vm = FactoryGirl.create(:vm_vmware,
                            :host     => host_2x2,
                            :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => "07"))
    allow(controller).to receive(:x_node).and_return("v-#{vm.id}")

    get :show, :params => {:id => vm.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_reconfigure', :id => vm.id}
    expect(response.status).to eq(200)
    expect(response.body).to include('Disks')
  end

  it 'the reconfigure tab displays the submit and cancel buttons' do
    vm = FactoryGirl.create(:vm_vmware,
                            :host     => host_2x2,
                            :hardware => FactoryGirl.create(:hardware, :cpu1x1, :ram1GB, :virtual_hw_version => "07"))
    allow(controller).to receive(:x_node).and_return("v-#{vm.id}")

    get :show, :params => {:id => vm.id}
    expect(response).to redirect_to(:action => 'explorer')

    post :explorer
    expect(response.status).to eq(200)

    post :x_button, :params => {:pressed => 'vm_reconfigure', :id => vm.id}
    expect(response.status).to eq(200)
    expect(response.body).to include("miq-button alt='Submit'")
    expect(response.body).to include("miq-button alt='Cancel'")
  end

  context "breadcrumbs" do
    subject { controller.instance_variable_get(:@breadcrumbs) }

    context "skip or drop breadcrumb" do
      before { get :explorer }

      it 'skips dropping a breadcrumb when a button action is executed' do
        post :x_button, :params => {:id => vm_vmware.id, :pressed => 'vm_ownership'}
        expect(subject).to eq([{:name => "VM or Templates", :url => "/vm_infra/explorer"}])
      end

      it 'drops a breadcrumb when an action allowing breadcrumbs is executed' do
        post :accordion_select, :params => {:id => "vms_filter"}
        expect(subject).to eq([{:name => "Virtual Machines", :url => "/vm_infra/explorer"}])
      end
    end

    context "clear or retain existing breadcrumb path" do
      before { allow(controller).to receive_messages(:render => nil, :build_toolbar => nil) }

      it 'it clears the existing breadcrumb path and assigns the new explorer path when controllers are switched' do
        session[:breadcrumbs] = [{:name => "Instances", :url => "/vm_cloud/explorer"}]
        allow(controller).to receive(:x_node).and_return("v-#{vm_vmware.id}")
        get :explorer
        expect(subject).to eq([{:name => "VM or Templates", :url => "/vm_infra/explorer"}])
      end

      it 'retains the breadcrumb path when cancel is pressed from a VM action' do
        get :explorer
        allow(controller).to receive(:x_node).and_return("v-#{vm_vmware.id}")
        post :x_button, :params => {:id => vm_vmware.id, :pressed => 'vm_ownership'}

        controller.instance_variable_set(:@in_a_form, nil)
        post :ownership_update, :params => {:button => 'cancel'}

        expect(subject).to eq([{:name => "VM or Templates", :url => "/vm_infra/explorer"}])
      end
    end
  end

  it "gets explorer when the request.referrer action is of type 'post'" do
    allow(request).to receive(:referrer).and_return("http://localhost:3000/configuration/update")
    get :explorer
    expect(response.status).to eq(200)
  end

  it "render creation snapshot flash message" do
    session[:edit] = {:explorer => true}
    post :snap_vm, :params => {:name        => "test",
                               :description => "test",
                               :button      => "create",
                               :id          => vm_vmware.id}
    expect(assigns(:flash_array).first[:message]).to include("Create Snapshot")
  end

  context 'simple searching' do
    let(:vm1) { FactoryGirl.create(:vm_vmware, :name => 'foobar') }
    let(:vm2) { FactoryGirl.create(:vm_vmware, :name => 'barbar') }

    describe '#x_search_by_name' do
      it 'render GTL with and saves search_text in the session' do
        seed_session_trees('vm_infra', 'vandt_tree', 'root')
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name => 'VmOrTemplate',
          :parent_id  => nil,
          :explorer   => true,
        )

        post :x_search_by_name, :params => {:search_text => 'foobar'}
        expect(session.fetch_path(:sandboxes, 'vm_infra', :search_text)).to eq('foobar')
        expect(response.status).to eq(200)
      end
    end

    describe '#report_data' do
      it 'returns VMs filtered by the search text' do
        vm1
        vm2

        session[:sandboxes] = {}
        session.store_path(:sandboxes, 'vm_infra', :search_text, 'foobar')
        report_data_request(
          :model     => 'VmOrTemplate',
          :parent_id => nil,
          :explorer  => true,
        )
        results = assert_report_data_response
        expect(results['data']['rows'].length).to eq(1)
        expect(results['data']['rows'][0]['long_id']).to eq(vm1.id.to_s)
      end
    end
  end

  include_examples '#download_summary_pdf', :vm_vmware
  include_examples '#download_summary_pdf', :template_vmware

  it_behaves_like "explorer controller with custom buttons"

  it "executes select_check? and disable_check? helper methods" do
    admin_user = FactoryGirl.create(:user_with_group, :role => 'super_administrator')
    wf = FactoryGirl.create(:miq_provision_workflow, :requester => admin_user)

    controller.send(:select_check?, wf)
    expect(response.status).to eq(200)

    controller.send(:disable_check?, wf)
    expect(response.status).to eq(200)
  end

  it "should not add search variables in @edit[:new] when rendering Policy assignment form" do
    controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
    controller.instance_variable_set(
      :@_params,
      :pressed                => "vm_protect",
      "check_#{vm_vmware.id}" => "1",
      :active_tree            => "vandt_tree",
      :model_name             => "VmOrTemplate",
      :model                  => "VmOrTemplate",
      :explorer               => true,
      :additional_options     => {:in_a_form => true}
    )
    edit = {:new => {}, :current => {}}
    controller.instance_variable_set(:@sb, {})
    controller.instance_variable_set(:@edit, edit)
    session[:edit] = edit
    allow(controller).to receive(:assign_policies)
    allow(controller).to receive(:replace_right_cell)
    controller.send(:x_button)
    controller.report_data
    expect(assigns(:edit)[:new]).to_not include(:expression)
  end
end
