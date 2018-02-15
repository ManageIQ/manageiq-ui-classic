describe CloudNetworkController do
  include_examples :shared_examples_for_cloud_network_controller, %w(openstack azure google amazon)

  context "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      @ct = FactoryGirl.create(:cloud_network, :name => "cloud-network-01")
      allow(@ct).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryGirl.create(:classification, :name => "department", :description => "Department")
      @tag1 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification)
      @tag2 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@ct).and_return([@tag1, @tag2])
      session[:tag_db] = "CloudNetwork"
      edit = {
        :key        => "CloudNetwork_edit_tags__#{@ct.id}",
        :tagging    => "CloudNetwork",
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
      post :button, :params => { :pressed => "cloud_network_tag", :format => :js, :id => @ct.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_network/show/#{@ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => @ct.id }
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_network/show/#{@ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => @ct.id }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @network = FactoryGirl.create(:cloud_network)
      login_as FactoryGirl.create(:user)
    end

    subject do
      get :show, :params => {:id => @network.id}
    end

    context "render listnav partial" do
      render_views
      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_cloud_network")
      end
    end
  end

  describe "#new" do
    let(:feature) { MiqProductFeature.find_all_by_identifier(%w(cloud_network_new)) }
    let(:role)    { FactoryGirl.create(:miq_user_role, :miq_product_features => feature) }
    let(:group)   { FactoryGirl.create(:miq_group, :miq_user_role => role) }
    let(:user)    { FactoryGirl.create(:user, :miq_groups => [group]) }

    before do
      bypass_rescue

      EvmSpecHelper.create_guid_miq_server_zone
      EvmSpecHelper.seed_specific_product_features(%w(cloud_network_new ems_network_show_list))

      allow(User).to receive(:current_user).and_return(user)
      allow(Rbac).to receive(:role_allows?).and_call_original
      login_as user
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
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryGirl.create(:ems_openstack).network_manager
      @network = FactoryGirl.create(:cloud_network_openstack)
    end

    context "#create" do
      let(:task_options) do
        {
          :action => "creating Cloud Network for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end

      let(:cloud_tenant) do
        FactoryGirl.create(:cloud_tenant)
      end

      let(:queue_options) do
        {
          :class_name  => @ems.class.name,
          :method_name => 'create_cloud_network',
          :instance_id => @ems.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
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

      it "builds create screen" do
        post :button, :params => { :pressed => "cloud_network_new", :format => :js }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the create action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :create, :params => {
          :button                => 'add',
          :controller            => 'cloud_network',
          :format                => :js,
          :cloud_tenant          => {:id => cloud_tenant.id},
          :ems_id                => @ems.id,
          :enabled               => true,
          :external_facing       => false,
          :id                    => 'new',
          :name                  => 'test',
          :provider_network_type => 'vxlan',
          :shared                => false
        }
      end
    end
  end

  describe "#edit" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryGirl.create(:ems_openstack).network_manager
      @network = FactoryGirl.create(:cloud_network_openstack, :ext_management_system => @ems)
    end

    context "#edit" do
      let(:task_options) do
        {
          :action => "updating Cloud Network for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end

      let(:queue_options) do
        {
          :class_name  => @network.class.name,
          :method_name => 'raw_update_cloud_network',
          :instance_id => @network.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => [{:name => "test2", :admin_state_up => false, :shared => false, :external_facing => false}]
        }
      end

      it "builds edit screen" do
        post :button, :params => { :pressed => "cloud_network_edit", :format => :js, :id => @network.id }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the update action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :update, :params => { :button => "save", :format => :js, :id => @network.id, :name => "test2" }
      end
    end
  end

  describe "#delete" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryGirl.create(:ems_openstack).network_manager
      @network = FactoryGirl.create(:cloud_network_openstack, :ext_management_system => @ems)
      session[:cloud_network_lastaction] = 'show'
    end

    context "#delete" do
      let(:task_options) do
        {
          :action => "deleting Cloud Network for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @network.class.name,
          :method_name => 'raw_delete_cloud_network',
          :instance_id => @network.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => 'ems_operations',
          :zone        => @ems.my_zone,
          :args        => []
        }
      end
      it "queues the delete action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        controller.instance_variable_set(:@_params,
                                         :pressed => "cloud_network_delete",
                                         :id      => @network.id)
        allow(controller).to receive(:find_checked_ids_with_rbac).and_return([@network])
        allow(controller).to receive(:find_id_with_rbac).and_return([@network])
        controller.instance_variable_set(:@breadcrumbs, [{:url => "cloud_network/show_list"}, 'placeholder'])
        expect(controller).to receive(:render)
        controller.send(:button)
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first).to eq(:message => "Delete initiated for 1 Cloud Network.",
                                           :level   => :success)
      end
    end
  end

  describe '#button' do
    before do
      controller.instance_variable_set(:@_params, params)
    end

    context 'tagging instances from a list of instances, accessed from the details page of a network' do
      let(:params) { {:pressed => "instance_tag"} }

      it 'calls tag method for tagging instances' do
        expect(controller).to receive(:tag).with("VmOrTemplate")
        controller.send(:button)
      end
    end

    context 'tagging network routers from a list of routers, accessed from the details page of a network' do
      let(:params) { {:pressed => "network_router_tag"} }

      it 'calls tag method for tagging network routers' do
        expect(controller).to receive(:tag).with("NetworkRouter")
        controller.send(:button)
      end
    end
  end
end
