describe HostAggregateController do
  let!(:user) { stub_user(:features => :all) }
  let(:ems) { FactoryGirl.create(:ems_openstack) }

  let(:aggregate) do
    FactoryGirl.create(:host_aggregate_openstack, :ext_management_system => ems)
  end

  let(:host) do
    FactoryGirl.create(:host_openstack_infra, :ext_management_system => ems)
  end

  before do
    EvmSpecHelper.create_guid_miq_server_zone
  end

  describe "#button" do
    let(:aggregate) { FactoryGirl.create(:host_aggregate) }

    after do
      expect(assigns(:flash_array)).to be_nil
    end

    it "handles host_aggregate_tag" do
      expect(controller).to receive(:tag).with(HostAggregate).and_call_original
      post :button, :params => { :pressed => "host_aggregate_tag", :format => :js, :id => aggregate.id }
    end

    it "handles host_aggregate_new" do
      expect(controller).to receive(:handle_host_aggregate_new).and_call_original
      post :button, :params => { :pressed => "host_aggregate_new", :format => :js }
    end

    it "handles host_aggregate_edit" do
      expect(controller).to receive(:handle_host_aggregate_edit).and_call_original
      post :button, :params => { :pressed => "host_aggregate_edit", :format => :js, :id => aggregate.id }
    end

    it "handles host_aggregate_add_host" do
      expect(controller).to receive(:handle_host_aggregate_add_host).and_call_original
      post :button, :params => { :pressed => "host_aggregate_add_host", :format => :js, :id => aggregate.id }
    end

    it "builds remove host screen" do
      expect(controller).to receive(:handle_host_aggregate_remove_host).and_call_original
      post :button, :params => { :pressed => "host_aggregate_remove_host", :format => :js, :id => aggregate.id }
    end
  end

  describe "#show" do
    let(:aggregate) { FactoryGirl.create(:host_aggregate) }

    subject do
      get :show, :params => {:id => aggregate.id}
    end

    render_views

    it "renders listnav partial" do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/listnav/_host_aggregate")
    end
  end

  include_examples '#download_summary_pdf', :host_aggregate_openstack

  describe "#create" do
    let(:aggregate) { FactoryGirl.create(:host_aggregate_openstack) }

    let(:task_options) do
      {
        :action => "creating Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => aggregate.class.name,
        :method_name => "create_aggregate",
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => [ems.id, {:name => "foo", :ems_id => ems.id.to_s }]
      }
    end

    it "queues the create action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :create, :params => { :button => "add", :format => :js, :name => 'foo', :ems_id => ems.id }
    end
  end

  describe "#edit" do
    let(:task_options) do
      {
        :action => "updating Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => aggregate.class.name,
        :method_name => "update_aggregate",
        :instance_id => aggregate.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => [{:name => "foo"}]
      }
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :update, :params => { :button => "save", :format => :js, :id => aggregate.id, :name => "foo" }
    end
  end

  describe "deleting" do
    let(:task_options) do
      {
        :action => "deleting Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => aggregate.class.name,
        :method_name => "delete_aggregate",
        :instance_id => aggregate.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => []
      }
    end

    it "queues the delete action" do
      expect(controller).to receive(:handle_host_aggregate_delete).and_call_original
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :button, :params => { :id => aggregate.id, :pressed => "host_aggregate_delete", :format => :js }
    end
  end

  describe "#add_host" do
    let(:task_options) do
      {
        :action => "Adding Host to Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => aggregate.class.name,
        :method_name => "add_host",
        :instance_id => aggregate.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => [host.id]
      }
    end

    it "queues the add host action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :add_host, :params => { :button => "addHost", :format => :js, :id => aggregate.id, :host_id => host.id }
    end
  end

  describe "#remove_host" do
    let(:task_options) do
      {
        :action => "Removing Host from Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => aggregate.class.name,
        :method_name => "remove_host",
        :instance_id => aggregate.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => [host.id]
      }
    end

    it "queues the remove host action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :remove_host, :params => {
        :button  => "removeHost",
        :format  => :js,
        :id      => aggregate.id,
        :host_id => host.id
      }
    end
  end
end
