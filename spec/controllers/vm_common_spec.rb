describe VmOrTemplateController do
  describe "#snap_pressed" do
    before do
      stub_user(:features => :all)
      @vm = FactoryBot.create(:vm_vmware)
      @snapshot = FactoryBot.create(:snapshot, :vm_or_template_id => @vm.id,
                                                :name              => 'EvmSnapshot',
                                                :description       => "Some Description")
      @vm.snapshots = [@snapshot]
      tree_hash = {
        :trees         => {
          :vandt_tree => {
            :active_node => "v-#{@vm.id}"
          }
        },
        :active_tree   => :vandt_tree,
        :active_accord => :vandt
      }

      session[:sandboxes] = {"vm_or_template" => tree_hash}
    end

    it "snapshot node exists in tree" do
      post :snap_pressed, :params => { :id => @snapshot.id }
      expect(assigns(:flash_array)).to be_blank
    end

    it "when snapshot is selected center toolbars are replaced" do
      allow(controller).to receive(:javascript_reload_toolbars).and_return(nil)
      post :snap_pressed, :params => { :id => @snapshot.id }
      expect(assigns(:flash_array)).to be_blank
    end

    it "when snapshot is selected parent vm record remains the same" do
      sb = session[:sandboxes]["vm_or_template"]
      sb[sb[:active_accord]] = "v-#{@vm.id}"
      sb[:trees][:vandt_tree][:active_node] = "f-1"
      post :snap_pressed, :params => { :id => @snapshot.id }
      expect(assigns(:record).id).to eq(@vm.id)
    end

    it "deleted node pressed in snapshot tree" do
      post :snap_pressed, :params => { :id => "some_id" }
      expect(assigns(:flash_array).first[:message]).to eq("Last selected Snapshot no longer exists")
      expect(assigns(:flash_array).first[:level]).to eq(:error)
    end
  end

  describe '#reload ' do
    before do
      login_as FactoryBot.create(:user_with_group, :role => "operator")
      allow(controller).to receive(:tree_select).and_return(nil)
      @folder = FactoryBot.create(:ems_folder)
      @vm = FactoryBot.create(:vm_cloud)
    end

    it 'sets params[:id] to hidden vm if its summary is displayed' do
      allow(controller).to receive(:x_node).and_return('f-' + @folder.id.to_s)
      controller.instance_variable_set(:@_params, :id => @vm.id.to_s)
      controller.reload
      expect(controller.params[:id]).to eq("v-#{@vm.id}")
    end

  end

  describe "#show" do
    before do
      allow(User).to receive(:server_timezone).and_return("UTC")
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      allow(controller).to receive(:check_privileges).and_return(true)
      EvmSpecHelper.seed_specific_product_features("vandt_accord", "vms_instances_filter_accord")
      @vm = FactoryBot.create(:vm_vmware)
    end

    it "redirects user to explorer that they have access to" do
      feature = MiqProductFeature.find_all_by_identifier(["vandt_accord"])
      login_as FactoryBot.create(:user, :features => feature)
      controller.instance_variable_set(:@sb, {})
      get :show, :params => {:id => @vm.id}
      expect(response).to redirect_to(:controller => "vm_infra", :action => 'explorer')
    end

    it "redirects user to Workloads explorer when user does not have access to Infra Explorer" do
      feature = MiqProductFeature.find_all_by_identifier(["vms_instances_filter_accord"])
      login_as FactoryBot.create(:user, :features => feature)
      controller.instance_variable_set(:@sb, {})
      get :show, :params => {:id => @vm.id}
      expect(response).to redirect_to(:controller => "vm_or_template", :action => 'explorer')
    end

    it "redirects user back to the url they came from when user does not have access to any of VM Explorers" do
      feature = MiqProductFeature.find_all_by_identifier(["dashboard_show"])
      login_as FactoryBot.create(:user, :features => feature)
      controller.instance_variable_set(:@sb, {})
      request.env["HTTP_REFERER"] = "http://localhost:3000/dashboard/show"
      get :show, :params => {:id => @vm.id}
      expect(response).to redirect_to(:controller => "dashboard", :action => 'show')
      expect(assigns(:flash_array).first[:message]).to include("is not authorized to access")
    end

    it "Redirects user with privileges to vm_infra/explorer" do
      stub_user(:features => :all)
      get :show, :params => {:id => @vm.id}
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:controller => "vm_infra", :action => 'explorer')
    end

    it "Redirects user to the referer controller/action" do
      login_as FactoryBot.create(:user)
      request.env["HTTP_REFERER"] = "http://localhost:3000/dashboard/show"
      allow(controller).to receive(:find_record_with_rbac).and_return(nil)
      get :show, :params => {:id => @vm.id}
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:controller => "dashboard", :action => 'show')
    end

    context 'set session[:snap_selected]' do
      before do
        tree_hash = {
          :trees         => {
            :vandt_tree => {
              :active_node => "v-#{@vm.id}"
            }
          },
          :active_tree   => :vandt_tree,
          :active_accord => :vandt
        }
        session[:sandboxes] = {'vm_or_template' => tree_hash}
        @lastaction = 'show'
        @display = 'snapshot_info'
        @request.env['HTTP_X_REQUESTED_WITH'] = 'XMLHttpRequest'
      end

      it 'to snap_selected.id if a Snapshot exists' do
        @snapshot = FactoryBot.create(:snapshot,
                                       :vm_or_template_id => @vm.id,
                                       :name              => 'EvmSnapshot',
                                       :description       => 'Some Description')
        @vm.snapshots = [@snapshot]
        post :show, :params => {:id => @vm.id, :display => 'snapshot_info'}
        expect(session[:snap_selected]).to eq(@snapshot.id)
      end

      it 'to nil if Snapshot does not exist' do
        session[:snap_selected] = '21'
        get :show, :params => {:id => @vm.id, :display => 'snapshot_info'}
        expect(session[:snap_selected]).to be(nil)
      end
    end
  end

  describe '#console_after_task' do
    let(:vm) { FactoryBot.create(:vm_vmware) }
    let(:task) { FactoryBot.create(:miq_task, :task_results => task_results) }
    subject { controller.send(:console_after_task, 'html5') }

    before do
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
    end

    context 'console with websocket URL' do
      let(:url) { '/ws/console/123456' }
      let(:task_results) { {:url => url} }

      it 'renders javascript to open a popup' do
        allow(controller).to receive(:params).and_return(:task_id => task.id)
        expect(subject).to match(%r{openUrl.*/vm_or_template/launch_html5_console\?#{task_results.to_query}"})
      end
    end

    context 'console with remote URL' do
      let(:url) { 'http://www.manageiq.org' }
      let(:task_results) { {:remote_url => url} }

      it 'renders javascript to open a popup' do
        expect(controller).to receive(:params).and_return(:task_id => task.id)
        expect(subject).to include("openUrl\":\"#{url}\"")
      end
    end
  end

  describe '#replace_right_cell' do
    it 'should display form button on Migrate request screen' do
      vm = FactoryBot.create(:vm_infra)
      allow(controller).to receive(:params).and_return(:action => 'vm_migrate')
      controller.instance_eval { @sb = {:active_tree => :vandt_tree, :action => "migrate"} }
      controller.instance_eval { @record = vm }
      controller.instance_eval { @in_a_form = true }
      allow(controller).to receive(:render).and_return(nil)
      presenter = ExplorerPresenter.new(:active_tree => :vandt_tree)
      expect(controller).to receive(:render_to_string).with(:partial => "layouts/breadcrumbs").exactly(1).times
      expect(controller).to receive(:render_to_string).with(:partial => "miq_request/prov_edit",
                                                            :locals  => {:controller => "vm"}).exactly(1).times
      expect(controller).to receive(:render_to_string).with(:partial => "layouts/x_adv_searchbox",
                                                            :locals  => {:nameonly => true}).exactly(1).times
      expect(controller).to receive(:render_to_string).with(:partial => "layouts/x_edit_buttons",
                                                            :locals  => {:action_url      => "prov_edit",
                                                                         :record_id       => vm.id,
                                                                         :no_reset        => true,
                                                                         :submit_button   => true,
                                                                         :continue_button => false}).exactly(1).times
      controller.send(:replace_right_cell, :action => 'migrate', :presenter => presenter)
      expect(presenter[:update_partials]).to have_key(:form_buttons_div)
    end

    context 'Instance policy simulation' do
      let(:vm_openstack) { FactoryBot.create(:vm_openstack, :ext_management_system => FactoryBot.create(:ems_openstack)) }

      before do
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@record, vm_openstack)
        controller.instance_variable_set(:@sb, :action => 'policy_sim')
        request.parameters[:controller] = 'vm_or_template'
      end

      it 'sets right cell text for policy simulation page' do
        controller.send(:replace_right_cell)
        expect(controller.instance_variable_get(:@right_cell_text)).to eq('Instance Policy Simulation')
      end

      it 'sets tree expand all to false for policy simulation tree' do
        allow(controller).to receive(:params).and_return(:action => 'policy_sim')
        presenter = ExplorerPresenter.new(:active_tree => :policy_simulation_tree)
        controller.send(:replace_right_cell)
        expect(presenter[:tree_expand_all]).to be_falsey
      end
    end
  end

  describe '#parent_folder_id' do
    it 'returns id of orphaned folder for orphaned VM/Template' do
      vm_orph = FactoryBot.create(:vm_infra, :storage => FactoryBot.create(:storage))
      template_orph = FactoryBot.create(:template_infra, :storage => FactoryBot.create(:storage))
      expect(controller.parent_folder_id(vm_orph)).to eq('xx-orph')
      expect(controller.parent_folder_id(template_orph)).to eq('xx-orph')
    end

    it 'returns id of archived folder for archived VM/Template' do
      vm_arch = FactoryBot.create(:vm_infra)
      template_arch = FactoryBot.create(:template_infra)
      expect(controller.parent_folder_id(vm_arch)).to eq('xx-arch')
      expect(controller.parent_folder_id(template_arch)).to eq('xx-arch')
    end

    it 'returns id of Availability Zone folder for Cloud VM that has one' do
      vm_cloud_with_az = FactoryBot.create(:vm_cloud,
                                            :ext_management_system => FactoryBot.create(:ems_google),
                                            :storage               => FactoryBot.create(:storage),
                                            :availability_zone     => FactoryBot.create(:availability_zone_google))
      expect(controller.parent_folder_id(vm_cloud_with_az)).to eq(TreeBuilder.build_node_id(vm_cloud_with_az.availability_zone))
    end

    it 'returns id of Provider folder for Cloud VM without Availability Zone' do
      vm_cloud_without_az = FactoryBot.create(:vm_cloud,
                                               :ext_management_system => FactoryBot.create(:ems_google),
                                               :storage               => FactoryBot.create(:storage),
                                               :availability_zone     => nil)
      expect(controller.parent_folder_id(vm_cloud_without_az)).to eq(TreeBuilder.build_node_id(vm_cloud_without_az.ext_management_system))
    end

    it 'returns id of Provider folder for Cloud Template' do
      template_cloud = FactoryBot.create(:template_cloud,
                                          :ext_management_system => FactoryBot.create(:ems_google),
                                          :storage               => FactoryBot.create(:storage))
      expect(controller.parent_folder_id(template_cloud)).to eq(TreeBuilder.build_node_id(template_cloud.ext_management_system))
    end

    it 'returns id of Provider folder for infra VM/Template without blue folder' do
      vm_infra = FactoryBot.create(:vm_infra, :ext_management_system => FactoryBot.create(:ems_infra))
      template_infra = FactoryBot.create(:template_infra, :ext_management_system => FactoryBot.create(:ems_infra))
      expect(controller.parent_folder_id(vm_infra)).to eq(TreeBuilder.build_node_id(vm_infra.ext_management_system))
      expect(controller.parent_folder_id(template_infra)).to eq(TreeBuilder.build_node_id(template_infra.ext_management_system))
    end

    it 'returns id of Datacenter folder for infra VM/Template without blue folder but with Datacenter parent' do
      datacenter = FactoryBot.create(:datacenter, :hidden => true)
      vm_infra_datacenter = FactoryBot.create(:vm_infra, :ext_management_system => FactoryBot.create(:ems_infra))
      template_infra_datacenter = FactoryBot.create(:template_infra, :ext_management_system => FactoryBot.create(:ems_infra))
      vm_infra_datacenter.with_relationship_type("ems_metadata") { vm_infra_datacenter.parent = datacenter }
      allow(vm_infra_datacenter).to receive(:parent_datacenter).and_return(datacenter)
      template_infra_datacenter.with_relationship_type("ems_metadata") { template_infra_datacenter.parent = datacenter }
      allow(template_infra_datacenter).to receive(:parent_datacenter).and_return(datacenter)
      expect(controller.parent_folder_id(vm_infra_datacenter)).to eq(TreeBuilder.build_node_id(datacenter))
      expect(controller.parent_folder_id(template_infra_datacenter)).to eq(TreeBuilder.build_node_id(datacenter))
    end

    it 'returns id of blue folder for VM/Template with one' do
      folder = FactoryBot.create(:ems_folder)
      vm_infra_folder = FactoryBot.create(:vm_infra, :ext_management_system => FactoryBot.create(:ems_infra))
      vm_infra_folder.with_relationship_type("ems_metadata") { vm_infra_folder.parent = folder } # add folder
      template_infra_folder = FactoryBot.create(:template_infra,
                                                 :ext_management_system => FactoryBot.create(:ems_infra))
      template_infra_folder.with_relationship_type("ems_metadata") { template_infra_folder.parent = folder } # add folder
      expect(controller.parent_folder_id(vm_infra_folder)).to eq(TreeBuilder.build_node_id(folder))
      expect(controller.parent_folder_id(template_infra_folder)).to eq(TreeBuilder.build_node_id(folder))
    end
  end

  describe "#resolve_node_info" do
    let(:vm_common) do
      Class.new do
        extend VmCommon
      end
    end
    before do
      login_as FactoryBot.create(:user_with_group, :role => "operator")
      @vm_arch = FactoryBot.create(:vm)
    end

    it 'when VM hidden select parent in tree but show VMs info' do
      allow(vm_common).to receive(:x_node=) { |id| expect(id).to eq(controller.parent_folder_id(@vm_arch)) }
      allow(vm_common).to receive(:get_node_info) { |id| expect(id).to eq(TreeBuilder.build_node_id(@vm_arch)) }
      vm_common.resolve_node_info("v-#{@vm_arch[:id]}")
    end
  end

  describe '#evm_relationship_get_form_vars' do
    before do
      @vm = FactoryBot.create(:vm_vmware)
      edit = {:vm_id => @vm.id, :new => {:server => nil}}
      controller.instance_variable_set(:@edit, edit)
    end

    it 'does not set new server when params[:server_id] is not set' do
      controller.instance_variable_set(:@_params, :server_id => '')
      controller.send(:evm_relationship_get_form_vars)
      expect(assigns(:edit)[:new][:server]).to be(nil)
    end

    it 'sets new server when params[:server_id] is set' do
      controller.instance_variable_set(:@_params, :server_id => '42')
      controller.send(:evm_relationship_get_form_vars)
      expect(assigns(:edit)[:new][:server]).to eq(controller.params[:server_id])
    end
  end

  include_examples '#download_summary_pdf', :vm_cloud
  include_examples '#download_summary_pdf', :vm_infra
end

describe VmInfraController do
  include_examples '#download_summary_pdf', :template_infra
end
