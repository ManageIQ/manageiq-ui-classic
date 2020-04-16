describe HostAggregateController do
  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      @aggregate = FactoryBot.create(:host_aggregate)
      login_as FactoryBot.create(:user_admin)
    end

    subject do
      get :show, :params => {:id => @aggregate.id}
    end

    context "render listnav partial" do
      render_views

      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_host_aggregate")
      end
    end
  end

  include_examples '#download_summary_pdf', :host_aggregate_openstack

  describe "#create" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack)
      @aggregate = FactoryBot.create(:host_aggregate_openstack)
    end

    let(:task_options) do
      {
        :action => "creating Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => @aggregate.class.name,
        :method_name => "create_aggregate",
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => @ems.my_zone,
        :args        => [@ems.id, {:name => "foo", :ems_id => @ems.id.to_s }]
      }
    end

    it "builds create screen" do
      post :create, :params => { :button => "add", :format => :js, :name => 'foo', :ems_id => @ems.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the create action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :create, :params => { :button => "add", :format => :js, :name => 'foo', :ems_id => @ems.id }
    end
  end

  describe "#update" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack)
      @aggregate = FactoryBot.create(:host_aggregate_openstack,
                                      :ext_management_system => @ems)
    end

    let(:task_options) do
      {
        :action => "updating Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => @aggregate.class.name,
        :method_name => "update_aggregate",
        :instance_id => @aggregate.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => @ems.my_zone,
        :args        => [{:name => "foo"}]
      }
    end

    it "builds edit screen" do
      post :update, :params => { :button => "save", :format => :js, :id => @aggregate.id, :name => "foo" }
      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
      post :update, :params => { :button => "save", :format => :js, :id => @aggregate.id, :name => "foo" }
    end
  end

  describe "#delete" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack)
      @aggregate = FactoryBot.create(:host_aggregate_openstack,
                                      :ext_management_system => @ems)
    end

    context "#edit" do
      let(:task_options) do
        {
          :action => "deleting Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @aggregate.class.name,
          :method_name => "delete_aggregate",
          :instance_id => @aggregate.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => "ems_operations",
          :zone        => @ems.my_zone,
          :args        => []
        }
      end

      it "queues the delete action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :button, :params => { :id => @aggregate.id, :pressed => "host_aggregate_delete", :format => :js }
      end
    end
  end

  describe "#add_host" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack)
      @aggregate = FactoryBot.create(:host_aggregate_openstack,
                                      :ext_management_system => @ems)
      @host = FactoryBot.create(:host_openstack_infra, :ext_management_system => @ems)
    end

    context "#add_host" do
      let(:task_options) do
        {
          :action => "Adding Host to Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @aggregate.class.name,
          :method_name => "add_host",
          :instance_id => @aggregate.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => "ems_operations",
          :zone        => @ems.my_zone,
          :args        => [@host.id]
        }
      end

      it "builds add host screen" do
        post :button, :params => { :pressed => "host_aggregate_add_host", :format => :js, :id => @aggregate.id }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the add host action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :add_host, :params => { :button => "addHost", :format => :js, :id => @aggregate.id, :host_id => @host.id }
      end
    end
  end

  describe "#remove_host" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      @ems = FactoryBot.create(:ems_openstack)
      @aggregate = FactoryBot.create(:host_aggregate_openstack,
                                      :ext_management_system => @ems)
      @host = FactoryBot.create(:host_openstack_infra, :ext_management_system => @ems)
    end

    context "#remove_host" do
      let(:task_options) do
        {
          :action => "Removing Host from Host Aggregate for user %{user}" % {:user => controller.current_user.userid},
          :userid => controller.current_user.userid
        }
      end
      let(:queue_options) do
        {
          :class_name  => @aggregate.class.name,
          :method_name => "remove_host",
          :instance_id => @aggregate.id,
          :priority    => MiqQueue::HIGH_PRIORITY,
          :role        => "ems_operations",
          :zone        => @ems.my_zone,
          :args        => [@host.id]
        }
      end

      it "builds remove host screen" do
        post :button, :params => { :pressed => "host_aggregate_remove_host", :format => :js, :id => @aggregate.id }
        expect(assigns(:flash_array)).to be_nil
      end

      it "queues the remove host action" do
        expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)
        post :remove_host, :params => {
          :button  => "removeHost",
          :format  => :js,
          :id      => @aggregate.id,
          :host_id => @host.id
        }
      end
    end
  end

  describe '#button' do
    context 'Check Compliance of Last Known Configuration on Instances' do
      let(:vm_instance) { FactoryBot.create(:vm_or_template) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:drop_breadcrumb)
        allow(controller).to receive(:performed?)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'instances')
        controller.params = {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => aggregate.id.to_s, :controller => 'host_aggregate'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          vm_instance.add_policy(policy)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end
end
