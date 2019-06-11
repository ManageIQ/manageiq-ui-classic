describe NetworkRouterController do
  include_examples :shared_examples_for_network_router_controller, %w(openstack azure google amazon)

  context "#tags_edit" do
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

    subject do
      get :show, :params => {:id => @router.id}
    end

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

    context "#create" do
      let(:task_options) do
        {
          :action => "creating Network Router for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end

      let(:cloud_tenant) do
        FactoryBot.create(:cloud_tenant)
      end

      let(:queue_options) do
        {
          :class_name  => @ems.class.name,
          :method_name => 'create_network_router',
          :instance_id => @ems.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => [{
            :name            => 'test',
            :admin_state_up  => 'true',
            :ems_id          => @ems.id.to_s,
            :cloud_subnet_id => ''
          }]
        }
      end

      it "builds create screen" do
        post :button, :params => { :pressed => "network_router_new", :format => :js }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the create action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
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
  end

  describe "#edit" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack).network_manager
      @router = FactoryBot.create(:network_router_openstack,
                                   :ext_management_system => @ems)
    end

    context "#edit" do
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
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => [{:name => "foo2", :external_gateway_info => {}}]
        }
      end

      it "builds edit screen" do
        post :button, :params => { :pressed => "network_router_edit", :format => :js, :id => @router.id }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the update action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :update, :params => {
          :button => "save",
          :format => :js,
          :id     => @router.id,
          :name   => "foo2"
        }
      end
    end
  end

  describe "#delete_network_routers" do
    let(:ems) { FactoryBot.create(:ems_openstack).network_manager }
    let(:router) { FactoryBot.create(:network_router_openstack, :name => "router-01", :ext_management_system => ems) }
    before do
      stub_user(:features => :all)
      setup_zone
      controller.params = {:id => router.id}
      controller.instance_variable_set(:@lastaction, "show")
      controller.instance_variable_set(:@layout, "network_router")
    end
    it "it calls process_network_routers function" do
      expect(controller).to receive(:process_network_routers).with([NetworkRouter], "destroy")

      controller.send(:delete_network_routers)
    end
  end

  describe "#delete" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack).network_manager
      @router = FactoryBot.create(:network_router_openstack,
                                   :ext_management_system => @ems)
      session[:network_router_lastaction] = 'show'
    end

    context "#delete" do
      let(:task_options) do
        {
          :action => "deleting Network Router for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @router.class.name,
          :method_name => 'raw_delete_network_router',
          :instance_id => @router.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => []
        }
      end

      it "queues the delete action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        controller.instance_variable_set(:@_params,
                                         :pressed => "network_router_delete",
                                         :id      => @router.id)
        controller.instance_variable_set(:@lastaction, "show")
        controller.instance_variable_set(:@layout, "network_router")
        controller.instance_variable_set(:@breadcrumbs, [{:name => "foo", :url => "network_router/show_list"}, {:name => "bar", :url => "network_router/show"}])
        expect(controller).to receive(:render)
        controller.send(:button)
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first).to eq(:message => "Delete initiated for 1 Network Router.",
                                           :level   => :success)
      end
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

    context "#add_interface" do
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
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => "ems_operations",
          :zone        => @ems.my_zone,
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
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :add_interface, :params => {
          :button          => "add",
          :format          => :js,
          :id              => @router.id,
          :cloud_subnet_id => @subnet.id
        }
      end
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

    context "#remove_interface" do
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
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => "ems_operations",
          :zone        => @ems.my_zone,
          :args        => [@subnet.id]
        }
      end

      it "builds remove interface screen" do
        post :button, :params => { :pressed => "network_router_remove_interface", :format => :js, :id => @router.id }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the remove interface action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :remove_interface, :params => {
          :button          => "remove",
          :format          => :js,
          :id              => @router.id,
          :cloud_subnet_id => @subnet.id
        }
      end
    end
  end

  describe '#button' do
    before do
      controller.params = params
    end

    context 'tagging instances from a list of instances, accessed from the details page of a network router' do
      let(:params) { {:pressed => "instance_tag"} }

      it 'calls tag method for tagging instances' do
        expect(controller).to receive(:tag).with("VmOrTemplate")
        controller.send(:button)
      end
    end

    context 'tagging cloud subnets from a list of subnets, accessed from the details page of a network router' do
      let(:params) { {:pressed => "cloud_subnet_tag"} }

      it 'calls tag method for tagging cloud subnets' do
        expect(controller).to receive(:tag).with("CloudSubnet")
        controller.send(:button)
      end
    end
  end
end
