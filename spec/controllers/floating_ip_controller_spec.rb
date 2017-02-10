describe FloatingIpController do
  include_examples :shared_examples_for_floating_ip_controller, %w(openstack azure google amazon)

  let!(:user) { stub_user(:features => :all) }
  let(:ems)   { FactoryGirl.create(:ems_openstack).network_manager }
  let(:flip)  { FactoryGirl.create(:floating_ip) }

  before do
    EvmSpecHelper.create_guid_miq_server_zone
  end

  describe "#button" do
    it "handles floating_ip_tag" do
      expect(controller).to receive(:tag)
      post :button, :params => { :pressed => "floating_ip_tag", :format => :js, :id => flip.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "handles floating_ip_new" do
      expect(controller).to receive(:handle_floating_ip_new)
      post :button, :params => { :pressed => "floating_ip_new", :format => :js }
      expect(assigns(:flash_array)).to be_nil
    end

    it "handles floating_ip_edit" do
      expect(controller).to receive(:handle_floating_ip_edit)
      post :button, :params => { :pressed => "floating_ip_edit", :format => :js, :id => flip.id }
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

    let(:edit) do
      {
        :key        => "FloatingIp_edit_tags__#{flip.id}",
        :tagging    => "FloatingIp",
        :object_ids => [flip.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
    end

    before do
      allow(flip).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      allow(Classification).to receive(:find_assigned_entries).with(flip).and_return([tag1, tag2])
      session[:tag_db] = "FloatingIp"
      session[:edit] = edit
      session[:breadcrumbs] = [{:url => "floating_ip/show/#{flip.id}"}, 'placeholder']
    end

    after do
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => flip.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
    end

    it "save tags" do
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => flip.id }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
    end
  end

  describe "#show" do
    before do
      flip = FactoryGirl.create(:floating_ip)
      login_as FactoryGirl.create(:user)
    end

    subject do
      get :show, :params => {:id => flip.id}
    end

    render_views

    it "renders the listnav partial" do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/listnav/_floating_ip")
    end
  end

  describe "#create" do
    let(:flip) { FactoryGirl.create(:floating_ip_openstack) }

    context "#create" do
      let(:task_options) do
        {
          :action => "creating Floating IP for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => ems.class.name,
          :method_name => 'create_floating_ip',
          :instance_id => ems.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => ems.my_zone,
          :args        => [{}]
        }
      end

      it "queues the create action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :create, :params => { :button => "add", :format => :js, :name => 'test',
                                   :tenant_id => 'id', :ems_id => ems.id }
      end
    end
  end

  describe "#edit" do
    let(:flip) { FactoryGirl.create(:floating_ip_openstack, :ext_management_system => ems) }

    context "#edit" do
      let(:task_options) do
        {
          :action => "updating Floating IP for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end

      let(:queue_options) do
        {
          :class_name  => flip.class.name,
          :method_name => 'raw_update_floating_ip',
          :instance_id => flip.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => ems.my_zone,
          :args        => [{:network_port_ems_ref => ""}]
        }
      end

      it "queues the update action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :update, :params => { :button => "save", :format => :js, :id => flip.id,
                                   :network_port_ems_ref => "" }
      end
    end
  end

  describe "deleting" do
    let(:flip) { FactoryGirl.create(:floating_ip_openstack, :ext_management_system => ems) }

    let(:task_options) do
      {
        :action => "deleting Floating IP for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => flip.class.name,
        :method_name => 'raw_delete_floating_ip',
        :instance_id => flip.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => []
      }
    end

    it "queues the delete action" do
      expect(controller).to receive(:handle_floating_ip_delete).and_call_original
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :button, :params => { :id => flip.id, :pressed => "floating_ip_delete", :format => :js }
    end
  end
end
