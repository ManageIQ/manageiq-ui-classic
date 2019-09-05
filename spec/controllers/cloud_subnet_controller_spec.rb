describe CloudSubnetController do
  let(:ems) { FactoryBot.create(:ems_openstack).network_manager }
  let(:cloud_subnet) { FactoryBot.create(:cloud_subnet_openstack, :ext_management_system => ems) }

  before { EvmSpecHelper.create_guid_miq_server_zone }

  describe "#tags_edit" do
    let(:classification) { FactoryBot.create(:classification) }
    let(:tag1) { FactoryBot.create(:classification_tag, :parent => classification) }
    let(:tag2) { FactoryBot.create(:classification_tag, :parent => classification) }
    let(:ct) { FactoryBot.create(:cloud_subnet) }

    before do
      stub_user(:features => :all)
      session[:tag_db] = "CloudSubnet"
      session[:edit] = {
        :key        => "CloudSubnet_edit_tags__#{ct.id}",
        :tagging    => "CloudSubnet",
        :object_ids => [ct.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "cloud_subnet_tag", :format => :js, :id => ct.id }

      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_subnet/show/#{ct.id}"}, 'placeholder']

      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => ct.id }

      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_subnet/show/#{ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => ct.id, :data => get_tags_json([tag1, tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end
  end

  describe "#show" do
    let(:subnet) { FactoryBot.create(:cloud_subnet) }

    before { login_as FactoryBot.create(:user) }

    render_views

    it "renders listnav partial" do
      get :show, :params => {:id => subnet.id}

      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => "layouts/listnav/_cloud_subnet")
    end
  end

  describe "#new" do
    before do
      bypass_rescue

      EvmSpecHelper.seed_specific_product_features(%w(cloud_subnet_new ems_network_show_list cloud_network_show_list cloud_tenant_show_list))

      feature = MiqProductFeature.find_all_by_identifier(%w(cloud_subnet_new))
      role = FactoryBot.create(:miq_user_role, :miq_product_features => feature)
      group = FactoryBot.create(:miq_group, :miq_user_role => role)
      login_as FactoryBot.create(:user, :miq_groups => [group])
    end

    it "raises exception wheh used have not privilege" do
      expect { post :new, :params => { :button => "new", :format => :js } }.to raise_error(MiqException::RbacPrivilegeException)
    end

    context "user don't have privilege for cloud tenants" do
      let(:feature) { MiqProductFeature.find_all_by_identifier(%w(cloud_subnet_new ems_network_show_list)) }

      it "raises exception" do
        expect { post :new, :params => { :button => "new", :format => :js } }.to raise_error(MiqException::RbacPrivilegeException)
      end
    end

    context "user don't have privilege for cloud networks" do
      let(:feature) { MiqProductFeature.find_all_by_identifier(%w(cloud_subnet_new ems_network_show_list cloud_tenant_show_list)) }

      it "raises exception" do
        expect { post :new, :params => { :button => "new", :format => :js } }.to raise_error(MiqException::RbacPrivilegeException)
      end
    end
  end

  describe "#create" do
    let(:cloud_subnet) { FactoryBot.create(:cloud_subnet_openstack) }
    let(:task_options) do
      {
        :action => "creating Cloud Subnet for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:cloud_tenant) { FactoryBot.create(:cloud_tenant) }
    let(:cloud_network) { FactoryBot.create(:cloud_network_openstack) }
    let(:queue_options) do
      {
        :class_name  => ems.class.name,
        :method_name => 'create_cloud_subnet',
        :instance_id => ems.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => [{
          :name             => 'test',
          :ip_version       => 4,
          :cloud_tenant     => cloud_tenant,
          :network_id       => cloud_network.ems_ref,
          :enable_dhcp      => "true",
          :allocation_pools => [{"start" => "172.10.1.10", "end" => "172.10.1.20"}],
          :host_routes      => [{"destination" => "172.12.1.0/24", "nexthop" => "172.12.1.1"}],
          :dns_nameservers  => ["172.11.1.1"]
        }]
      }
    end

    before { stub_user(:features => :all) }

    it "builds create screen" do
      post :button, :params => { :pressed => "cloud_subnetnew", :format => :js }

      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the create action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)

      post :create, :params => {
        :button           => 'add',
        :controller       => 'cloud_subnet',
        :format           => :js,
        :cloud_tenant     => {:id => cloud_tenant.id},
        :dhcp_enabled     => true,
        :ems_id           => ems.id,
        :id               => 'new',
        :name             => 'test',
        :network_protocol => 'ipv4',
        :network_id       => cloud_network.ems_ref,
        :allocation_pools => "172.10.1.10,172.10.1.20",
        :host_routes      => "172.12.1.0/24,172.12.1.1",
        :dns_nameservers  => "172.11.1.1"
      }
    end
  end

  describe "#edit" do
    let(:task_options) do
      {
        :action => "updating Cloud Subnet for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => cloud_subnet.class.name,
        :method_name => 'raw_update_cloud_subnet',
        :instance_id => cloud_subnet.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => [{
          :name             => 'test2',
          :enable_dhcp      => false,
          :allocation_pools => [{"start" => "172.20.1.10", "end" => "172.20.1.20"}],
          :host_routes      => [{"destination" => "172.22.1.0/24", "nexthop" => "172.22.1.1"}],
          :dns_nameservers  => ["172.21.1.1"]
        }]
      }
    end

    before { stub_user(:features => :all) }

    it "builds edit screen" do
      post :button, :params => { :pressed => "cloud_subnet_edit", :format => :js, :id => cloud_subnet.id }

      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)

      post :update, :params => {
        :button           => 'save',
        :format           => :js,
        :id               => cloud_subnet.id,
        :name             => 'test2',
        :allocation_pools => "172.20.1.10,172.20.1.20",
        :host_routes      => "172.22.1.0/24,172.22.1.1",
        :dns_nameservers  => "172.21.1.1"
      }
    end
  end

  describe "#delete" do
    let(:task_options) do
      {
        :action => "deleting Cloud Subnet for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => cloud_subnet.class.name,
        :method_name => 'raw_delete_cloud_subnet',
        :instance_id => cloud_subnet.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => 'ems_operations',
        :zone        => ems.my_zone,
        :args        => []
      }
    end

    before do
      stub_user(:features => :all)
      session[:cloud_subnet_lastaction] = 'show'
    end

    it "queues the delete action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)

      post :button, :params => { :id => cloud_subnet.id, :pressed => "cloud_subnet_delete", :format => :js }
    end
  end

  describe '#button' do
    before { controller.params = params }

    context 'comparing Instances displayed in a nested list' do
      let(:params) { {:pressed => 'instance_compare'} }

      it 'calls comparemiq to compare Instances' do
        expect(controller).to receive(:comparemiq)
        controller.send(:button)
      end
    end

    context 'adding new Cloud Subnet' do
      let(:params) { {:pressed => 'cloud_subnet_new'} }

      it 'redirects to action new' do
        expect(controller).to receive(:javascript_redirect).with(:action => 'new')
        controller.send(:button)
      end
    end
  end

  include_examples '#download_summary_pdf', :cloud_subnet_openstack

  include_examples :shared_examples_for_cloud_subnet_controller, %w(openstack azure google amazon)
end
