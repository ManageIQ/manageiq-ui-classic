describe FloatingIpController do
  include_examples :shared_examples_for_floating_ip_controller, %w(openstack azure google amazon)

  context "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @ct = FactoryBot.create(:floating_ip)
      allow(@ct).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryBot.create(:classification, :name => "department", :description => "Department")
      @tag1 = FactoryBot.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@ct).and_return([@tag1, @tag2])
      session[:tag_db] = "FloatingIp"
      edit = {
        :key        => "FloatingIp_edit_tags__#{@ct.id}",
        :tagging    => "FloatingIp",
        :object_ids => [@ct.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    describe "#delete_floating_ips" do
      let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }
      let!(:floating_ip) { FactoryBot.create(:floating_ip) }
      before do
        EvmSpecHelper.create_guid_miq_server_zone
        login_as admin_user
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:performed?)
        controller.instance_variable_set(:@_params, :id => floating_ip.id, :pressed => 'host_NECO')
      end

      it "delete floating ips" do
        expect(controller).to receive(:process_floating_ips).with([floating_ip], "destroy")
        controller.send(:delete_floating_ips)
      end
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "floating_ip_tag", :format => :js, :id => @ct.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "floating_ip/show/#{@ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => @ct.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "floating_ip/show/#{@ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => @ct.id, :data => get_tags_json([@tag1, @tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @floating_ip = FactoryBot.create(:floating_ip)
      login_as FactoryBot.create(:user)
    end

    subject do
      get :show, :params => {:id => @floating_ip.id}
    end

    context "render listnav partial" do
      render_views
      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_floating_ip")
      end
    end
  end

  describe "#create" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack).network_manager
      @floating_ip = FactoryBot.create(:floating_ip_openstack)
      stub_user(:features => :all)
    end

    context "#create" do
      let(:task_options) do
        {
          :action => "creating Floating IP for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @ems.class.name,
          :method_name => 'create_floating_ip',
          :instance_id => @ems.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => [{}]
        }
      end

      it "builds create screen" do
        post :button, :params => { :pressed => "floating_ip_new", :format => :js }
        expect(assigns(:flash_array)).to be_nil
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
      @ems = FactoryBot.create(:ems_openstack).network_manager
      @floating_ip = FactoryBot.create(:floating_ip_openstack, :ext_management_system => @ems)
    end

    context "#edit" do
      let(:task_options) do
        {
          :action => "updating Floating IP for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @floating_ip.class.name,
          :method_name => 'raw_update_floating_ip',
          :instance_id => @floating_ip.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => [{:network_port_ems_ref => ""}]
        }
      end

      it "builds edit screen" do
        post :button, :params => { :pressed => "floating_ip_edit", :format => :js, :id => @floating_ip.id }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the update action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :update, :params => { :button => "save", :format => :js, :id => @floating_ip.id,
                                   :network_port => {:ems_ref => ""}}
      end
    end
  end

  describe "#delete" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack).network_manager
      @floating_ip = FactoryBot.create(:floating_ip_openstack, :ext_management_system => @ems)
    end

    context "#delete" do
      let(:task_options) do
        {
          :action => "deleting Floating IP for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @floating_ip.class.name,
          :method_name => 'raw_delete_floating_ip',
          :instance_id => @floating_ip.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => []
        }
      end

      it "queues the delete action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :button, :params => { :id => @floating_ip.id, :pressed => "floating_ip_delete", :format => :js }
      end
    end
  end
end
