describe SecurityGroupController do
  include_examples :shared_examples_for_security_group_controller, %w(openstack azure google amazon)

  let!(:user) { stub_user(:features => :all) }
  let(:group) { FactoryGirl.create(:security_group, :name => "security-group-01") }
  let(:ems)   { FactoryGirl.create(:ems_openstack).network_manager }

  before do
    EvmSpecHelper.create_guid_miq_server_zone
  end

  describe "#button" do
    it "handles security_group_tag" do
      expect(controller).to receive(:tag).and_call_original
      post :button, :params => { :pressed => "security_group_tag", :format => :js, :id => group.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "handles handle_security_group_edit" do
      expect(controller).to receive(:handle_security_group_edit).and_call_original
      post :button, :params => { :pressed => "security_group_edit", :format => :js, :id => group.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "handles handle_security_group_new" do
      expect(controller).to receive(:handle_security_group_new).and_call_original
      post :button, :params => { :pressed => "security_group_new", :format => :js, :id => group.id }
      expect(assigns(:flash_array)).to be_nil
    end
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
      allow(group).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      allow(Classification).to receive(:find_assigned_entries).with(group).and_return([tag1, tag2])
      session[:tag_db] = "SecurityGroup"
      edit = {
        :key        => "SecurityGroup_edit_tags__#{group.id}",
        :tagging    => "SecurityGroup",
        :object_ids => [group.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
      session[:edit] = edit
    end

    after do
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "security_group/show/#{group.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => group.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "security_group/show/#{group.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => group.id }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  describe "#show" do
    let(:group) { FactoryGirl.create(:security_group_with_firewall_rules) }

    subject do
      get :show, :params => {:id => group.id}
    end

    render_views

    it "renders textual_groups_generic and security_group" do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => 'layouts/_textual_groups_generic')
      is_expected.to render_template(:partial => "layouts/listnav/_security_group")
    end
  end

  describe "#create" do
    let(:group) { FactoryGirl.create(:security_group_openstack, :ext_management_system => ems) }

    let(:task_options) do
      {
        :action => "creating Security Group for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => ems.class.name,
        :method_name => 'create_security_group',
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
    let(:group) { FactoryGirl.create(:security_group_openstack, :ext_management_system => ems) }

    let(:task_options) do
      {
        :action => "updating Security Group for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => group.class.name,
        :method_name => 'raw_update_security_group',
        :instance_id => group.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => [{:name => "foo2"}]
      }
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :update, :params => { :button => "save", :format => :js, :id => group.id, :name => "foo2" }
    end
  end

  describe "deleting" do
    let(:group) { FactoryGirl.create(:security_group_openstack, :ext_management_system => ems) }

    let(:task_options) do
      {
        :action => "deleting Security Group for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end

    let(:queue_options) do
      {
        :class_name  => group.class.name,
        :method_name => 'raw_delete_security_group',
        :instance_id => group.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => []
      }
    end

    it "queues the delete action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :button, :params => { :id => group.id, :pressed => "security_group_delete", :format => :js }
    end
  end
end
