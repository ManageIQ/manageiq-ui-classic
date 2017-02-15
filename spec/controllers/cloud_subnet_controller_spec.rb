describe CloudSubnetController do
  include_examples :shared_examples_for_cloud_subnet_controller, %w(openstack azure google amazon)

  let(:user) { stub_user(:features => :all) }
  let(:subnet) { FactoryGirl.create(:cloud_subnet, :name => "cloud-subnet-01") }

  describe "#button" do
    before do
      login_as user
      EvmSpecHelper.create_guid_miq_server_zone
      ApplicationController.handle_exceptions = true
    end

    it "handles cloud_subnet_tag pressed" do
      expect(controller).to receive(:tag)
      post :button, :params => { :pressed => "cloud_subnet_tag", :format => :js, :id => subnet.id }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "handles cloud_subnet_new pressed" do
      expect(controller).to receive(:handle_cloud_subnet_new)
      post :button, :params => { :pressed => "cloud_subnet_new", :format => :js }
      expect(assigns(:flash_array)).to be_nil
    end

    it "handles cloud_subnet_edit pressed" do
      expect(controller).to receive(:handle_cloud_subnet_edit)
      post :button, :params => { :pressed => "cloud_subnet_edit", :format => :js, :id => subnet.id }
      expect(assigns(:flash_array)).to be_nil
    end
  end

  describe "#tagging_edit" do
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      # @ct = FactoryGirl.create(:cloud_subnet, :name => "cloud-subnet-01")
      allow(subnet).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryGirl.create(:classification, :name => "department", :description => "Department")
      @tag1 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(subnet).and_return([@tag1, @tag2])
      session[:tag_db] = "CloudSubnet"
      edit = {
        :key        => "CloudSubnet_edit_tags__#{subnet.id}",
        :tagging    => "CloudSubnet",
        :object_ids => [subnet.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_subnet/show/#{subnet.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => subnet.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_subnet/show/#{subnet.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => subnet.id }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @subnet = FactoryGirl.create(:cloud_subnet)
      login_as FactoryGirl.create(:user)
    end

    subject do
      get :show, :params => {:id => @subnet.id}
    end

    context "render listnav partial" do
      render_views
      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_cloud_subnet")
      end
    end
  end

  describe "#create" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryGirl.create(:ems_openstack).network_manager
      @cloud_subnet = FactoryGirl.create(:cloud_subnet_openstack)
    end

    context "#create" do
      let(:task_options) do
        {
          :action => "creating Cloud Subnet for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @ems.class.name,
          :method_name => 'create_cloud_subnet',
          :instance_id => @ems.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => [{:name => "test", :ip_version => "4", :enable_dhcp => false}]
        }
      end

      it "queues the create action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :create, :params => { :button => "add", :format => :js, :name => 'test',
                                   :tenant_id => 'id', :ems_id => @ems.id }
      end
    end
  end

  describe "#edit" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryGirl.create(:ems_openstack).network_manager
      @cloud_subnet = FactoryGirl.create(:cloud_subnet_openstack, :ext_management_system => @ems)
    end

    context "#edit" do
      let(:task_options) do
        {
          :action => "updating Cloud Subnet for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @cloud_subnet.class.name,
          :method_name => 'raw_update_cloud_subnet',
          :instance_id => @cloud_subnet.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => [{:name => "foo2", :enable_dhcp => false}]
        }
      end

      it "queues the update action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :update, :params => { :button => "save", :format => :js, :id => @cloud_subnet.id, :name => "foo2" }
      end
    end
  end

  describe "deleting" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryGirl.create(:ems_openstack).network_manager
      @cloud_subnet = FactoryGirl.create(:cloud_subnet_openstack, :ext_management_system => @ems)
      session[:cloud_subnet_lastaction] = 'show'
    end

    let(:task_options) do
      {
        :action => "deleting Cloud Subnet for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => @cloud_subnet.class.name,
        :method_name => 'raw_delete_cloud_subnet',
        :instance_id => @cloud_subnet.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => @ems.my_zone,
        :args        => []
      }
    end

    it "queues the delete action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :button, :params => { :id => @cloud_subnet.id, :pressed => "cloud_subnet_delete", :format => :js }
    end
  end

  include_examples '#download_summary_pdf', :cloud_subnet_openstack
end
