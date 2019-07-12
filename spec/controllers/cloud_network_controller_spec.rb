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
    before { login_as FactoryBot.create(:user) }

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
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
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
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)

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
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => [{:name => "test2", :admin_state_up => false, :shared => false, :external_facing => false}]
      }
    end

    before { stub_user(:features => :all) }

    it "builds edit screen" do
      post :button, :params => { :pressed => "cloud_network_edit", :format => :js, :id => network.id }

      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)

      post :update, :params => { :button => "save", :format => :js, :id => network.id, :name => "test2" }
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
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
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
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
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
