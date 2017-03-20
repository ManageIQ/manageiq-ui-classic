describe NetworkRouterController do
  include_examples :shared_examples_for_network_router_controller, %w(openstack azure google amazon)

  let!(:user) { stub_user(:features => :all) }
  let(:ems)   { FactoryGirl.create(:ems_openstack).network_manager }

  let(:router) do
    FactoryGirl.create(:network_router_openstack, :ext_management_system => ems)
  end

  let(:subnet) do
    FactoryGirl.create(:cloud_subnet, :ext_management_system => ems)
  end

  before do
    EvmSpecHelper.create_guid_miq_server_zone
  end

  describe "#button" do
    # let(:router) { FactoryGirl.create(:network_router, :name => "router-01") }

    it "handles network_router_tag" do
      expect(controller).to receive(:tag)
      post :button, :params => { :pressed => "network_router_tag", :format => :js, :id => router.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "handles network_router_new" do
      expect(controller).to receive(:handle_network_router_new)
      post :button, :params => { :pressed => "network_router_new", :format => :js }
      expect(assigns(:flash_array)).to be_nil
    end

    %w(
      network_router_edit
      network_router_remove_interface
      network_router_add_interface
    ).each do |pressed|
      it "handles #{pressed}" do
        expect(controller).to receive("handle_#{pressed}".to_sym)
        post :button, :params => { :pressed => pressed, :format => :js, :id => router.id }
        expect(assigns(:flash_array)).to be_nil
      end
    end

    # it "builds edit screen" do
    #   post :button, :params => { :pressed => "network_router_edit", :format => :js, :id => router.id }
    #   expect(assigns(:flash_array)).to be_nil
    # end
    #
    # it "builds remove interface screen" do
    #   post :button, :params => { :pressed => "network_router_remove_interface", :format => :js, :id => router.id }
    #   expect(assigns(:flash_array)).to be_nil
    # end
    #
    # it "builds add interface screen" do
    #   post :button, :params => { :pressed => "network_router_add_interface", :format => :js, :id => router.id }
    #   expect(assigns(:flash_array)).to be_nil
    # end
  end

  describe "#tagging_edit" do
    let(:classification) do
      FactoryGirl.create(:classification, :name => "department", :description => "Department")
    end

    let(:tag1) do
      FactoryGirl.create(:classification_tag, :name => "tag1", :parent => classification)
    end

    let(:tag2) do
      FactoryGirl.create(:classification_tag, :name => "tag2", :parent => classification)
    end

    before do
      allow(router).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      allow(Classification).to receive(:find_assigned_entries).with(router).and_return([tag1, tag2])

      session[:tag_db] = "NetworkRouter"

      edit = {
        :key        => "NetworkRouter_edit_tags__#{router.id}",
        :tagging    => "NetworkRouter",
        :object_ids => [router.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }

      session[:edit] = edit
    end

    after do
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "network_router/show/#{router.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => router.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "network_router/show/#{router.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => router.id }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  describe "#show" do
    subject do
      get :show, :params => {:id => router.id}
    end

    render_views

    it "renders listnav partial" do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/listnav/_network_router")
    end
  end

  describe "#create" do
    let(:task_options) do
      {
        :action => "creating Network Router for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => ems.class.name,
        :method_name => 'create_network_router',
        :instance_id => ems.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => [{:name => "test"}]
      }
    end

    it "queues the create action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :create, :params => { :button => "add", :format => :js, :name => 'test',
                                 :tenant_id => 'id', :ems_id => ems.id }
    end
  end

  describe "#update" do
    let(:task_options) do
      {
        :action => "updating Network Router for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => router.class.name,
        :method_name => 'raw_update_network_router',
        :instance_id => router.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => [{:name => "foo2"}]
      }
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :update, :params => { :button => "save", :format => :js, :id => router.id, :name => "foo2" }
    end
  end

  describe "deleting" do
    let(:task_options) do
      {
        :action => "deleting Network Router for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => router.class.name,
        :method_name => 'raw_delete_network_router',
        :instance_id => router.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => []
      }
    end

    before do
      session[:network_router_lastaction] = 'show'
    end

    it "queues the delete action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :button, :params => { :id => router.id, :pressed => "network_router_delete", :format => :js }
    end
  end

  describe "#add_interface" do
    let(:task_options) do
      {
        :action => "Adding Interface to Network Router for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => router.class.name,
        :method_name => "raw_add_interface",
        :instance_id => router.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => [subnet.id]
      }
    end

    it "queues the add interface action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :add_interface, :params => {
        :button          => "add",
        :format          => :js,
        :id              => router.id,
        :cloud_subnet_id => subnet.id
      }
    end
  end

  describe "#remove_interface" do
    let(:subnet) { FactoryGirl.create(:cloud_subnet, :ext_management_system => ems) }

    let(:task_options) do
      {
        :action => "Removing Interface from Network Router for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => router.class.name,
        :method_name => "raw_remove_interface",
        :instance_id => router.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => [subnet.id]
      }
    end

    it "queues the remove interface action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :remove_interface, :params => {
        :button          => "remove",
        :format          => :js,
        :id              => router.id,
        :cloud_subnet_id => subnet.id
      }
    end
  end
end
