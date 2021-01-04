describe StorageController do
  let(:storage) { FactoryBot.create(:storage, :name => 'test_storage1') }
  let(:storage_cluster) { FactoryBot.create(:storage_cluster, :name => 'test_storage_cluster1') }
  let(:storage_with_miq_templates) do
    st = FactoryBot.create(:storage)
    2.times { st.all_miq_templates << FactoryBot.create(:miq_template) }
    st
  end

  before { stub_user(:features => :all) }

  describe "#button" do
    before { allow(controller).to receive(:performed?) }

    it "when VM Right Size Recommendations is pressed" do
      controller.params = {:pressed => "vm_right_size"}
      expect(controller).to receive(:vm_right_size)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Migrate is pressed" do
      controller.params = {:pressed => "vm_migrate"}
      controller.instance_variable_set(:@refresh_partial, "layouts/gtl")
      expect(controller).to receive(:prov_redirect).with("migrate")
      expect(controller).to receive(:render)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Retire is pressed" do
      controller.params = {:pressed => "vm_retire"}
      expect(controller).to receive(:retirevms).once
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Manage Policies is pressed" do
      controller.params = {:pressed => "vm_protect"}
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Manage Policies is pressed" do
      controller.params = {:pressed => "miq_template_protect"}
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Tag is pressed" do
      controller.params = {:pressed => "vm_tag"}
      expect(controller).to receive(:tag).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Tag is pressed" do
      controller.params = {:pressed => "miq_template_tag"}
      expect(controller).to receive(:tag).with(VmOrTemplate)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Host Analyze then Check Compliance is pressed" do
      controller.params = {:pressed => "host_analyze_check_compliance"}
      allow(controller).to receive(:show)
      expect(controller).to receive(:analyze_check_compliance_hosts)
      expect(controller).to receive(:render)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it 'calls comparemiq for comparing Hosts' do
      controller.params = {:pressed => "host_compare"}
      expect(controller).to receive(:comparemiq)
      controller.send(:button)
      expect(controller.instance_variable_get(:@flash_array)).to be_nil
    end

    {"host_standby"  => "Enter Standby Mode",
     "host_shutdown" => "Shut Down",
     "host_reboot"   => "Restart",
     "host_start"    => "Power On",
     "host_stop"     => "Power Off",
     "host_reset"    => "Reset"}.each do |button, description|
      it "when Host #{description} button is pressed" do
        login_as FactoryBot.create(:user, :features => button)

        host = FactoryBot.create(:host)
        command = button.split('_', 2)[1]
        allow_any_instance_of(Host).to receive(:is_available?).with(command).and_return(true)

        controller.params = {:pressed => button, :miq_grid_checks => host.id.to_s}
        controller.instance_variable_set(:@lastaction, "show_list")
        allow(controller).to receive(:show_list)
        expect(controller).to receive(:render)
        controller.button
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to include("successfully initiated")
        expect(flash_messages.first[:level]).to eq(:success)
      end
    end

    it 'returns proper record class' do
      expect(controller.send(:record_class)).to eq(Storage)
    end

    context 'nested list of VMs' do
      %w[all_vms vms].each do |display|
        before { controller.params = {:display => display} }

        it 'returns proper record class' do
          expect(controller.send(:record_class)).to eq(VmOrTemplate)
        end
      end
    end

    context 'Check Compliance action on VMs of a Datastore' do
      let(:vm) { FactoryBot.create(:vm_vmware) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'vms')
        controller.params = {:miq_grid_checks => vm.id.to_s, :pressed => 'vm_check_compliance', :id => storage.id.to_s, :controller => 'storage'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          EvmSpecHelper.create_guid_miq_server_zone
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

  context 'render_views' do
    render_views

    describe '#explorer' do
      before do
        session[:settings] = {:views => {}, :perpage => {:list => 5}}
        EvmSpecHelper.create_guid_miq_server_zone
      end

      it 'can render the explorer' do
        session[:sb] = {:active_accord => :storage_accord}
        seed_session_trees('storage', :storage_tree, 'root')
        get :explorer
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
      end

      it 'shows a datastore in the datastore list' do
        storage
        session[:sb] = {:active_accord => :storage_accord}
        seed_session_trees('storage', :storage_tree, 'root')

        get :explorer
        session_storage = session[:sandboxes]["storage"]
        expect(response.body).to include('"modelName":"Storage"')
        expect(response.body).to include("\"activeTree\":\"#{session_storage[:active_tree]}\"")
        expect(response.body).to include('"isExplorer":true')
        expect(response.body).to include('"parentId":')
        expect(response.body).to include('"sortColIdx":0')
        expect(response.body).to include("\"showUrl\":\"/#{session_storage[:active_accord]}/x_show/\"")
      end

      it 'show a datastore cluster in the datastore clusters list' do
        allow(controller).to receive(:x_node).and_return("root")
        storage
        storage_cluster
        session[:sb] = {:active_accord => :storage_pod_accord}
        seed_session_trees('storage', :storage_pod_tree, 'root')
        get :explorer
        expect(response.body).to include('test_storage_cluster1')
      end

      it "it handles x_button tagging" do
        ems = FactoryBot.create(:ems_vmware)
        datastore = FactoryBot.create(:storage, :name => 'storage_name')
        datastore.parent = ems
        classification = FactoryBot.create(:classification, :name => "department", :description => "Department")
        @tag1 = FactoryBot.create(:classification_tag,
                                   :name   => "tag1",
                                   :parent => classification)
        @tag2 = FactoryBot.create(:classification_tag,
                                   :name   => "tag2",
                                   :parent => classification)
        allow(Classification).to receive(:find_assigned_entries).and_return([@tag1, @tag2])
        post :x_button, :params => {:miq_grid_checks => datastore.id, :pressed => "storage_tag", :format => :js}
        expect(response.status).to eq(200)

        main_content = JSON.parse(response.body)['updatePartials']['main_div']
        expect(main_content).to include("<h3>\n1 Datastore Being Tagged\n<\/h3>")
        expect(main_content).to include('"modelName":"Storage"')
        expect(main_content).to include('"isExplorer":true')
      end

      it "tagging has no clickable quadicons" do
        ems = FactoryBot.create(:ems_vmware)
        datastore = FactoryBot.create(:storage, :name => 'storage_name')
        datastore.parent = ems
        classification = FactoryBot.create(:classification, :name => "department", :description => "Department")
        @tag1 = FactoryBot.create(:classification_tag,
                                   :name   => "tag1",
                                   :parent => classification)
        @tag2 = FactoryBot.create(:classification_tag,
                                   :name   => "tag2",
                                   :parent => classification)
        allow(Classification).to receive(:find_assigned_entries).and_return([@tag1, @tag2])

        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'Storage',
          :report_data_additional_options => {
            :model     => "Storage",
            :clickable => false
          }
        )

        post :x_button, :params => {:miq_grid_checks => datastore.id, :pressed => "storage_tag", :format => :js}

        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
      end

      it 'can Perform a datastore Smart State Analysis from the datastore summary page' do
        allow(controller).to receive(:x_node).and_return("ds-#{storage.id}")
        post :x_button, :params => {:pressed => 'storage_scan', :id => storage.id}
        expect(response.status).to eq(200)
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to_not include("Datastores no longer exists")
      end

      it 'can Perform a datastore Smart State Analysis from the datastore list' do
        storage
        seed_session_trees('storage', :storage_tree, 'root')
        get :explorer
        post :x_button, :params => {:pressed => 'storage_scan', :miq_grid_checks => storage.id, :format => :js}
        expect(response.status).to eq(200)
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to_not include("Datastores no longer exists")
      end

      it 'can Perform a datastore Smart State Analysis from the datastore cluster list' do
        storage
        storage_cluster
        seed_session_trees('storage', :storage_pod_tree, 'root')
        post :tree_select, :params => {:id => "xx-#{storage_cluster.id}", :format => :js}
        expect(response.status).to eq(200)
        post :x_button, :params => {:pressed => 'storage_scan', :miq_grid_checks => storage.id, :format => :js}
        expect(response.status).to eq(200)
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to_not include("Datastores no longer exists")
      end

      it 'can Perform a remove datastore from the datastore cluster list' do
        storage
        storage_cluster
        seed_session_trees('storage', :storage_pod_tree, 'root')
        post :tree_select, :params => {:id => "xx-#{storage_cluster.id}", :format => :js}
        expect(response.status).to eq(200)
        post :x_button, :params => {:pressed         => 'storage_delete',
                                    :miq_grid_checks => storage.id,
                                    :format          => :js}
        expect(response.status).to eq(200)
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to_not include("Datastores no longer exists")
      end

      it 'can render datastore details' do
        tree_node_id = TreeBuilder.build_node_id(storage)
        session[:sandboxes] = {} # no prior data in @sb
        session[:exp_parms] = {:controller => 'storage',
                               :action     => 'show',
                               :id         => tree_node_id}

        get :explorer
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
        expect(response).to render_template('layouts/_textual_groups_generic')
      end

      it " can render storage's miq templates" do
        storage_with_miq_templates
        get :show, :params => {:id => storage_with_miq_templates.id, :display => 'all_miq_templates'}
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
        expect(response.body).to include('All VM Templates')
      end

      it " returns VM Templates associated with selected Datastore" do
        req = {
          :model_name                     => 'MiqTemplate',
          :parent_id                      => storage_with_miq_templates.id.to_s,
          :display                        => 'all_miq_templates',
          :parent                         => storage_with_miq_templates,
          :report_data_additional_options => {
            :parent_class_name => 'Storage',
            :association       => 'all_miq_templates',
          }
        }
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(req)
        get :show, :params => { :id => storage_with_miq_templates.id, :display => 'all_miq_templates' }
        expect(response.status).to eq(200)
      end

      context 'getting the right tags of a datastore' do
        let(:datastore) { FactoryBot.create(:storage, :name => 'storage_name') }

        before do
          allow(controller).to receive(:render).and_return(true)
          allow(controller).to receive(:build_accordions_and_trees)

          controller.instance_variable_set(:@record, datastore)
          controller.instance_variable_set(:@sb, :active_tree => :storage_tree)
        end

        it 'calls get_tagdata to update tags of a datastore' do
          expect(controller).to receive(:get_tagdata).with(datastore)
          controller.send(:explorer)
        end
      end
    end

    describe "#tree_select" do
      before do
        storage
        storage_cluster
      end

      [
        ['Datastores', 'storage_tree'],
        ['All Datastore Clusters', 'storage_pod_tree'],
      ].each do |elements, tree|
        it "renders list of #{elements} for #{tree} root node" do
          session[:settings] = {}
          seed_session_trees('storage', tree.to_sym)

          post :tree_select, :params => { :id => 'root', :format => :js }
          expect(response.status).to eq(200)
        end
      end

      it 'renders list of Datastores in given cluster' do
        storage
        storage_cluster
        seed_session_trees('storage', :storage_pod_tree, 'root')
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'Storage',
          :parent_id                      => storage_cluster.id.to_s,
          :report_data_additional_options => {
            :association       => 'storages',
            :parent_class_name => 'StorageCluster',
          }
        )

        post :tree_select, :params => {:id => "xx-#{storage_cluster.id}", :format => :js}
        expect(response.status).to eq(200)
      end
    end
  end

  describe 'report_data' do
    context 'for selected StorageCluster' do
      it 'returns associated Storages' do
        storage_cluster.add_child(storage)

        report_data_request(
          :model        => 'Storage',
          :parent_model => 'StorageCluster',
          :parent_id    => storage_cluster.id,
          :association  => 'storages'
        )
        results = assert_report_data_response
        expect(results['data']['rows'].length).to eq(1)
        expect(results['data']['rows'][0]['long_id']).to eq(storage.id.to_s)
      end
    end
  end

  describe "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @ds = FactoryBot.create(:storage, :name => "Datastore-01")
      allow(@ds).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryBot.create(:classification, :name => "department", :description => "Department")
      @tag1 = FactoryBot.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@ds).and_return([@tag1, @tag2])
      session[:tag_db] = "Storage"
      edit = {
        :key        => "Storage_edit_tags__#{@ds.id}",
        :tagging    => "Storage",
        :object_ids => [@ds.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      post :button, :params => {:pressed => "storage_tag", :format => :js, :id => @ds.id}
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "storage/x_show/#{@ds.id}"}, 'placeholder']
      post :tagging_edit, :params => {:button => "cancel", :format => :js, :id => @ds.id}
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "storage/x_show/#{@ds.id}"}, 'placeholder']
      post :tagging_edit, :params => {:button => "save", :format => :js, :id => @ds.id, :data => get_tags_json([@tag1, @tag2])}
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end

    it "resets tags" do
      session[:breadcrumbs] = [{:url => "storage/x_show/#{@ds.id}"}, 'placeholder']
      session[:assigned_filters] = []
      post :tagging_edit, :params => {:button => "reset", :format => :js, :id => @ds.id}
      expect(assigns(:flash_array).first[:message]).to include("All changes have been reset")
    end
  end

  describe '#get_node_info' do
    context 'resetting session' do
      let(:datastore) { FactoryBot.create(:storage, :name => 'storage_name') }

      before do
        allow(controller).to receive(:session).and_return(:edit => {}, :adv_search => {'Storage' => {}})
        controller.instance_variable_set(:@edit, {})
        controller.instance_variable_set(:@record, datastore)
      end

      it 'calls session_reset method' do
        expect(controller).to receive(:session_reset)
        controller.send(:get_node_info, 'root')
      end

      it 'resets session to same values as first time in' do
        controller.send(:session_reset)
        expect(controller.instance_variable_get(:@edit)).to be(nil)
        expect(controller.session).to eq(:edit => nil, :adv_search => {'Storage' => nil})
      end
    end

    context 'setting right cell text' do
      before { controller.instance_variable_set(:@right_cell_text, 'All Datastores') }

      context 'searching text' do
        before { controller.instance_variable_set(:@search_text, 'Datastore') }

        it 'updates right cell text according to search text' do
          controller.send(:get_node_info, 'root')
          expect(controller.instance_variable_get(:@right_cell_text)).to eq("All Datastores (Names with \"Datastore\")")
        end
      end

      context 'using Advanced Search' do
        before do
          allow(controller).to receive(:x_tree).and_return(:tree => :storage_tree)
          allow(controller).to receive(:valid_active_node).and_return('ms-1')
          controller.instance_variable_set(:@edit, :adv_search_applied => {:text => " - Filtered by \"Filter1\""})
        end

        it 'updates right cell text according to chosen filter' do
          controller.send(:get_node_info, 'ms-1')
          expect(controller.instance_variable_get(:@right_cell_text)).to eq("All Datastores - Filtered by \"Filter1\"")
        end
      end
    end
  end

  include_examples '#download_summary_pdf', :storage

  it_behaves_like "controller with custom buttons"
end
