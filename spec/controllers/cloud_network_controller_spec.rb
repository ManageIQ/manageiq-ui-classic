describe CloudNetworkController do
  let(:classification) { FactoryBot.create(:classification) }
  let(:tag1) { FactoryBot.create(:classification_tag, :parent => classification) }
  let(:tag2) { FactoryBot.create(:classification_tag, :parent => classification) }
  let(:ct) { FactoryBot.create(:cloud_network) }
  let(:network) { FactoryBot.create(:cloud_network) }
  let(:ems) { FactoryBot.create(:ems_openstack).network_manager }

  before do
    FactoryBot.create(:tagging, :tag => tag1.tag, :taggable => ct)
    FactoryBot.create(:tagging, :tag => tag2.tag, :taggable => ct)
    EvmSpecHelper.create_guid_miq_server_zone
  end

  include_examples :shared_examples_for_cloud_network_controller, %w(openstack azure google amazon)

  describe "#tags_edit" do
    before do
      stub_user(:features => :all)
      session[:tag_db] = "CloudNetwork"
      session[:edit] = {
        :key        => "CloudNetwork_edit_tags__#{ct.id}",
        :tagging    => "CloudNetwork",
        :object_ids => [ct.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "cloud_network_tag", :format => :js, :id => ct.id }

      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_network/show/#{ct.id}"}, 'placeholder']

      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => ct.id }

      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_network/show/#{ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => ct.id, :data => get_tags_json([tag1, tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end
  end

  describe "#show" do
    before { login_as FactoryBot.create(:user_with_group) }

    render_views

    it "render listnav partial" do
      get(:show, :params => {:id => network.id})

      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => "layouts/listnav/_cloud_network")
    end

    it "render breadcrumb partial" do
      get(:show, :params => {:id => network.id})

      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => "layouts/_breadcrumbs")
    end
  end

  describe "#new" do
    before do
      bypass_rescue

      EvmSpecHelper.seed_specific_product_features(%w(cloud_network_new ems_network_show_list))

      feature = MiqProductFeature.find_all_by_identifier(%w(cloud_network_new))
      role = FactoryBot.create(:miq_user_role, :miq_product_features => feature)
      group = FactoryBot.create(:miq_group, :miq_user_role => role)
      login_as FactoryBot.create(:user, :miq_groups => [group])
    end

    it "raises exception when user don't have privilege" do
      expect { post :new, :params => { :button => "new", :format => :js } }.to raise_error(MiqException::RbacPrivilegeException)
    end

    context "user don't have privilege for cloud tenants" do
      let(:feature) { MiqProductFeature.find_all_by_identifier(%w(cloud_network_new ems_network_show_list)) }

      it "raises exception" do
        expect { post :new, :params => { :button => "new", :format => :js } }.to raise_error(MiqException::RbacPrivilegeException)
      end
    end
  end

  describe "#create" do
    let(:network) { FactoryBot.create(:cloud_network_openstack) }
    let(:task_options) do
      {
        :action => "creating Cloud Network for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:cloud_tenant) { FactoryBot.create(:cloud_tenant) }
    let(:queue_options) do
      {
        :class_name  => ems.class.name,
        :method_name => 'create_cloud_network',
        :instance_id => ems.id,
        :args        => [{
          :admin_state_up        => true,
          :external_facing       => false,
          :name                  => 'test',
          :provider_network_type => 'vxlan',
          :shared                => false,
          :tenant_id             => cloud_tenant.ems_ref,
        }]
      }
    end

    before { stub_user(:features => :all) }

    it "builds create screen" do
      post :button, :params => { :pressed => "cloud_network_new", :format => :js }

      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the create action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))

      post :create, :params => {
        :button                => 'add',
        :controller            => 'cloud_network',
        :format                => :js,
        :cloud_tenant          => {:id => cloud_tenant.id},
        :ems_id                => ems.id,
        :enabled               => true,
        :external_facing       => false,
        :id                    => 'new',
        :name                  => 'test',
        :provider_network_type => 'vxlan',
        :shared                => false
      }
    end
  end

  describe "#edit" do
    let(:network) { FactoryBot.create(:cloud_network_openstack, :ext_management_system => ems) }
    let(:task_options) do
      {
        :action => "updating Cloud Network for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => network.class.name,
        :method_name => 'raw_update_cloud_network',
        :instance_id => network.id,
        :args        => [{:name => "test2", :admin_state_up => false, :shared => false, :external_facing => false}]
      }
    end

    before { stub_user(:features => :all) }

    it "builds edit screen" do
      post :button, :params => { :pressed => "cloud_network_edit", :format => :js, :id => network.id }

      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))

      post :update, :params => { :button => "save", :format => :js, :id => network.id, :name => "test2" }
    end
  end

  describe '#update' do
    before do
      allow(controller).to receive(:assert_privileges)
      controller.params = {:button => 'cancel', :id => network.id}
    end

    it 'calls flash_and_redirect for canceling editing Cloud Network' do
      expect(controller).to receive(:flash_and_redirect).with(_("Edit of Cloud Network \"%{name}\" was cancelled by the user") % {:name => network.name})
      controller.send(:update)
    end
  end

  describe '#update_finished' do
    let(:miq_task) { double("MiqTask", :state => 'Finished', :status => 'ok', :message => 'some message') }

    before do
      allow(MiqTask).to receive(:find).with(123).and_return(miq_task)
      allow(controller).to receive(:session).and_return(:async => {:params => {:task_id => 123, :name => network.name}})
    end

    it 'calls flash_and_redirect with appropriate arguments for succesful updating of a Cloud Network' do
      expect(controller).to receive(:flash_and_redirect).with(_("Cloud Network \"%{name}\" updated") % {:name => network.name})
      controller.send(:update_finished)
    end

    context 'unsuccesful updating of a Cloud Network' do
      let(:miq_task) { double("MiqTask", :state => 'Finished', :status => 'Error', :message => 'some message') }

      it 'calls flash_and_redirect with appropriate arguments' do
        expect(controller).to receive(:flash_and_redirect).with(_("Unable to update Cloud Network \"%{name}\": %{details}") % {
          :name    => network.name,
          :details => miq_task.message
        }, :error)
        controller.send(:update_finished)
      end
    end
  end

  describe "#delete" do
    let(:network) { FactoryBot.create(:cloud_network_openstack, :ext_management_system => ems) }
    let(:task_options) do
      {
        :action => "deleting Cloud Network for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => network.class.name,
        :method_name => 'raw_delete_cloud_network',
        :instance_id => network.id,
        :args        => []
      }
    end

    before do
      stub_user(:features => :all)
      session[:cloud_network_lastaction] = 'show'
      controller.params = {:pressed => "cloud_network_delete",
                           :id      => network.id}
      controller.instance_variable_set(:@breadcrumbs, [{:url => "cloud_network/show_list"}, 'placeholder'])
    end

    it "queues the delete action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      expect(controller).to receive(:render)

      controller.send(:button)
      flash_messages = assigns(:flash_array)

      expect(flash_messages.first).to eq(:message => "Delete initiated for 1 Cloud Network.",
                                         :level   => :success)
    end
  end

  describe '#button' do
    before { controller.params = params }

    context 'tagging instances from a list of instances, accessed from the details page of a network' do
      let(:params) { {:pressed => "instance_tag"} }

      it 'calls tag method for tagging instances' do
        expect(controller).to receive(:tag).with(VmOrTemplate)

        controller.send(:button)
      end
    end

    %w[cloud_network cloud_subnet floating_ip network_router].each do |item|
      context "tagging #{item.camelize}" do
        let(:params) { {:pressed => "#{item}_tag"} }

        it 'calls tag method' do
          expect(controller).to receive(:tag).with(item.camelize.safe_constantize)
          controller.send(:button)
        end
      end
    end

    %w[delete evacuate pause refresh reset resize retire scan shelve start stop suspend terminate].each do |action|
      context "#{action} for selected Instances displayed in a nested list" do
        let(:params) { {:pressed => "instance_#{action}"} }

        it "calls #{action + 'vms'} method" do
          allow(controller).to receive(:show)
          allow(controller).to receive(:performed?).and_return(true)
          expect(controller).to receive((action + 'vms').to_sym)
          controller.send(:button)
        end
      end
    end

    context 'editing Instance displayed in a nested list' do
      let(:params) { {:pressed => 'instance_edit'} }

      it 'calls edit_record method' do
        allow(controller).to receive(:render_or_redirect_partial)
        expect(controller).to receive(:edit_record)
        controller.send(:button)
      end
    end

    context 'setting Ownership for Instances in a nested list' do
      let(:params) { {:pressed => 'instance_ownership'} }

      it 'calls set_ownership' do
        expect(controller).to receive(:set_ownership)
        controller.send(:button)
      end
    end

    context 'comparing Instances displayed in a nested list of Cloud Network' do
      let(:params) { {:pressed => 'instance_compare'} }

      it 'calls comparemiq method for comparing Instances' do
        expect(controller).to receive(:comparemiq)
        controller.send(:button)
      end
    end

    context 'custom buttons' do
      let(:params) { {:pressed => 'custom_button'} }

      it 'calls custom_buttons method' do
        expect(controller).to receive(:custom_buttons)
        controller.send(:button)
      end
    end

    context 'managing policies for selected Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_protect'} }

      it 'calls assign_policies method' do
        expect(controller).to receive(:assign_policies).with(VmOrTemplate)
        controller.send(:button)
      end
    end

    context 'policy simulation for selected Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_policy_sim'} }

      it 'calls polsimvms method' do
        expect(controller).to receive(:polsimvms)
        controller.send(:button)
      end
    end

    context 'provisioning Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_miq_request_new'} }

      it 'calls prov_redirect' do
        allow(controller).to receive(:render_or_redirect_partial)
        expect(controller).to receive(:prov_redirect)
        controller.send(:button)
      end
    end

    context 'retirement for Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_retire_now'} }

      it 'calls retirevms_now' do
        allow(controller).to receive(:show)
        allow(controller).to receive(:performed?).and_return(true)
        expect(controller).to receive(:retirevms_now)
        controller.send(:button)
      end
    end

    context 'Live Migrate of Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_live_migrate'} }

      it 'calls livemigratevms' do
        expect(controller).to receive(:livemigratevms)
        controller.send(:button)
      end
    end

    context 'Soft Reboot of Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_guest_restart'} }

      it 'calls guestreboot' do
        allow(controller).to receive(:show)
        allow(controller).to receive(:performed?).and_return(true)
        expect(controller).to receive(:guestreboot)
        controller.send(:button)
      end
    end

    context 'Check Compliance of Instances displayed in a nested list' do
      let(:params) { {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => network.id.to_s, :controller => 'cloud_network'} }
      let(:vm_instance) { FactoryBot.create(:vm_or_template) }

      before { allow(controller).to receive(:performed?).and_return(true) }

      it 'calls check_compliance_vms' do
        allow(controller).to receive(:show)
        expect(controller).to receive(:check_compliance_vms)
        controller.send(:button)
      end

      context 'Instance with VM Compliance policy assigned' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          EvmSpecHelper.create_guid_miq_server_zone
          allow(controller).to receive(:assert_privileges)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
          allow(controller).to receive(:drop_breadcrumb)
          vm_instance.add_policy(policy)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end

  describe "#delete_networks" do
    before do
      login_as FactoryBot.create(:user, :role => "super_administrator")
      controller.params = {:id => network.id, :pressed => 'cloud_network_delete'}
      allow(controller).to receive(:process_cloud_networks).with([network], "destroy")
    end

    it "deletes networks" do
      controller.send(:delete_networks)

      expect(response.status).to eq(200)
    end
  end
end
