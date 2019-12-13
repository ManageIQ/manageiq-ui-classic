describe NetworkRouterController do
  include_examples :shared_examples_for_network_router_controller, %w(openstack azure google amazon)

  describe "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @ct = FactoryBot.create(:network_router, :name => "router-01")
      allow(@ct).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryBot.create(:classification, :name => "department", :description => "Department")
      @tag1 = FactoryBot.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@ct).and_return([@tag1, @tag2])
      session[:tag_db] = "NetworkRouter"
      edit = {
        :key        => "NetworkRouter_edit_tags__#{@ct.id}",
        :tagging    => "NetworkRouter",
        :object_ids => [@ct.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "network_router_tag", :format => :js, :id => @ct.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "network_router/show/#{@ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => @ct.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "network_router/show/#{@ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => @ct.id, :data => get_tags_json([@tag1, @tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @router = FactoryBot.create(:network_router)
      login_as FactoryBot.create(:user, :features => %w(none))
    end

    subject { get :show, :params => {:id => @router.id} }

    context "render listnav partial" do
      render_views

      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_network_router")
      end
    end
  end

  describe "#new" do
    let(:feature) { "network_router_new" }
    let(:user)    { FactoryBot.create(:user, :features => feature) }

    before do
      bypass_rescue
      EvmSpecHelper.create_guid_miq_server_zone
      login_as user
    end

    it "raises exception when used have not privilege" do
      expect { post :new, :params => { :button => "new", :format => :js } }.to raise_error(MiqException::RbacPrivilegeException)
    end

    context "user don't have privilege for cloud tenants" do
      let(:feature) { %w(network_router_new ems_network_show_list) }

      it "raises exception" do
        expect { post :new, :params => { :button => "new", :format => :js } }.to raise_error(MiqException::RbacPrivilegeException)
      end
    end
  end

  describe "#create" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack).network_manager
      @router = FactoryBot.create(:network_router_openstack)
    end

    let(:task_options) do
      {
        :action => "creating Network Router for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:cloud_tenant) { FactoryBot.create(:cloud_tenant) }

    let(:queue_options) do
      {
        :class_name  => @ems.class.name,
        :method_name => 'create_network_router',
        :instance_id => @ems.id,
        :args        => [{
          :name            => 'test',
          :admin_state_up  => 'true',
          :ems_id          => @ems.id.to_s,
          :cloud_subnet_id => '',
          :cloud_tenant    => cloud_tenant
        }]
      }
    end

    it "builds create screen" do
      post :button, :params => { :pressed => "network_router_new", :format => :js }
      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the create action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :create, :params => {
        :button           => 'add',
        :controller       => 'network_router',
        :format           => :js,
        :name             => 'test',
        :admin_state_up   => 'true',
        :cloud_subnet_id  => '',
        :cloud_tenant     => {:id => cloud_tenant.id},
        :ems_id           => @ems.id,
        :external_gateway => 'false',
        :extra_attributes => '',
        :id               => 'new'
      }
    end
  end

  describe "#edit" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack).network_manager
      @router = FactoryBot.create(:network_router_openstack,
                                   :ext_management_system => @ems)
    end

    let(:task_options) do
      {
        :action => "updating Network Router for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => @router.class.name,
        :method_name => 'raw_update_network_router',
        :instance_id => @router.id,
        :args        => [{:name => "foo2", :external_gateway_info => {}}]
      }
    end

    it "builds edit screen" do
      post :button, :params => { :pressed => "network_router_edit", :format => :js, :id => @router.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :update, :params => {
        :button => "save",
        :format => :js,
        :id     => @router.id,
        :name   => "foo2"
      }
    end
  end

  describe "#add_interface" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack).network_manager
      @router = FactoryBot.create(:network_router_openstack,
                                   :ext_management_system => @ems)
      @subnet = FactoryBot.create(:cloud_subnet, :ext_management_system => @ems)
    end

    let(:task_options) do
      {
        :action => "Adding Interface to Network Router for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => @router.class.name,
        :method_name => "raw_add_interface",
        :instance_id => @router.id,
        :args        => [@subnet.id]
      }
    end

    it "builds add interface screen" do
      stub_user(:features => :all)
      post :button, :params => { :pressed => "network_router_add_interface", :format => :js, :id => @router.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it 'list subnet choices' do
      stub_user(:features => :all)
      allow(controller).to receive(:drop_breadcrumb)
      controller.instance_variable_set(:@router, @router)
      controller.params = {:id => @router.id}
      controller.send(:add_interface_select)
      subnet_choices = controller.instance_variable_get(:@subnet_choices)

      expect(subnet_choices).to eq(@subnet.name => @subnet.id)
      expect(assigns(:flash_array)).to be_nil
    end

    context 'with restricted user' do
      let!(:subnet_2) { FactoryBot.create(:cloud_subnet, :ext_management_system => @ems) }
      let(:user)    { FactoryBot.create(:user, :features => "network_router_add_interface") }
      let(:tag)     { "/managed/environment/prod" }

      before do
        allow(controller).to receive(:drop_breadcrumb)
        controller.instance_variable_set(:@router, @router)
        controller.params = {:id => @router.id}

        @router.tag_with(tag, :ns => '')
        subnet_2.tag_with(tag, :ns => '')

        user.current_group.entitlement.tap do |entitlement|
          entitlement.set_managed_filters([[tag]])
          entitlement.save!
        end
        login_as user
        allow(controller).to receive(:current_user).and_return(user)
      end

      it 'list subnet choices' do
        controller.instance_variable_set(:@router, @router)
        controller.params = {:id => @router.id}

        controller.send(:add_interface_select)
        subnet_choices = controller.instance_variable_get(:@subnet_choices)
        expect(subnet_choices).to eq(subnet_2.name => subnet_2.id)
        expect(assigns(:flash_array)).to be_nil
      end
    end

    it "queues the add interface action" do
      stub_user(:features => :all)
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :add_interface, :params => {
        :button          => "add",
        :format          => :js,
        :id              => @router.id,
        :cloud_subnet_id => @subnet.id
      }
    end
  end

  describe "#remove_interface" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack).network_manager
      @router = FactoryBot.create(:network_router_openstack,
                                   :ext_management_system => @ems)
      @subnet = FactoryBot.create(:cloud_subnet, :ext_management_system => @ems)
    end

    let(:task_options) do
      {
        :action => "Removing Interface from Network Router for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => @router.class.name,
        :method_name => "raw_remove_interface",
        :instance_id => @router.id,
        :args        => [@subnet.id]
      }
    end

    it "builds remove interface screen" do
      post :button, :params => { :pressed => "network_router_remove_interface", :format => :js, :id => @router.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the remove interface action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :remove_interface, :params => {
        :button          => "remove",
        :format          => :js,
        :id              => @router.id,
        :cloud_subnet_id => @subnet.id
      }
    end
  end

  describe '#button' do
    let(:router) { FactoryBot.create(:network_router) }

    before { controller.params = params }

    context 'tagging Instances in a nested list' do
      let(:params) { {:pressed => 'instance_tag'} }

      it 'calls tag method' do
        expect(controller).to receive(:tag).with(VmOrTemplate)
        controller.send(:button)
      end
    end

    %w[cloud_subnet floating_ip network_router security_group].each do |item|
      context "tagging #{item.camelize}" do
        let(:params) { {:pressed => "#{item}_tag"} }

        it 'calls tag method' do
          expect(controller).to receive(:tag).with(item.camelize.safe_constantize)
          controller.send(:button)
        end
      end
    end

    context 'comparing Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_compare'} }

      it 'calls comparemiq to compare Instances' do
        expect(controller).to receive(:comparemiq)
        controller.send(:button)
      end
    end

    context 'adding Interface to Router' do
      let(:params) { {:pressed => 'network_router_add_interface', :id => router.id.to_s} }

      it 'redirects to add_interface_select' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'add_interface_select', :id => router.id.to_s)
        controller.send(:button)
      end
    end

    context 'removing Interface from Router' do
      let(:params) { {:pressed => 'network_router_remove_interface', :id => router.id.to_s} }

      it 'redirects to remove_interface_select' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'remove_interface_select', :id => router.id.to_s)
        controller.send(:button)
      end
    end

    context 'editing Network Router' do
      let(:params) { {:pressed => 'network_router_edit', :id => router.id.to_s} }

      it 'redirects to edit method' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'edit', :id => router.id.to_s)
        controller.send(:button)
      end
    end

    context 'adding new Network Router' do
      let(:params) { {:pressed => 'network_router_new'} }

      it 'redirects to new method' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'new')
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

    context 'managing policies for Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_protect'} }

      it 'calls assign_policies method' do
        expect(controller).to receive(:assign_policies).with(VmOrTemplate)
        controller.send(:button)
      end
    end

    context 'policy simulation for Instances displayed in a nested list' do
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
      let(:params) { {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => router.id.to_s, :controller => 'network_router'} }
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
end
