describe HostAggregateController do
  let(:ems) { FactoryBot.create(:ems_openstack) }
  let(:aggregate) { FactoryBot.create(:host_aggregate_openstack, :ext_management_system => ems) }
  let(:host) { FactoryBot.create(:host_openstack_infra, :ext_management_system => ems) }

  before do
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryBot.create(:user_admin)
  end

  describe "#show" do
    subject { get :show, :params => {:id => aggregate.id} }

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
        :args        => [ems.id, {:name => "foo", :ems_id => ems.id.to_s }]
      }
    end

    it "builds create screen" do
      post :create, :params => { :button => "add", :format => :js, :name => 'foo', :ems_id => ems.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the create action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :create, :params => { :button => "add", :format => :js, :name => 'foo', :ems_id => ems.id }
    end
  end

  describe '#create_finished' do
    let(:miq_task) { double("MiqTask", :state => 'Finished', :status => status, :message => 'some message') }
    let(:status) { 'Error' }

    before do
      allow(MiqTask).to receive(:find).with(123).and_return(miq_task)
      allow(controller).to receive(:session).and_return(:async => {:params => {:task_id => 123, :name => aggregate.name}})
    end

    it 'calls flash_and_redirect with appropriate arguments' do
      expect(controller).to receive(:flash_and_redirect).with(_("Unable to create Host Aggregate \"%{name}\": %{details}") % {
        :name    => aggregate.name,
        :details => miq_task.message
      }, :error)
      controller.send(:create_finished)
    end

    context 'succesful creating of new Host Aggregate' do
      let(:status) { 'ok' }

      it 'calls flash_and_redirect with appropriate arguments' do
        expect(controller).to receive(:flash_and_redirect).with(_("Host Aggregate \"%{name}\" created") % {:name => aggregate.name})
        controller.send(:create_finished)
      end
    end
  end

  describe "#update" do
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
        :args        => [{:name => "foo"}]
      }
    end

    it "builds edit screen" do
      post :update, :params => { :button => "save", :format => :js, :id => aggregate.id, :name => "foo" }
      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :update, :params => { :button => "save", :format => :js, :id => aggregate.id, :name => "foo" }
    end

    context 'canceling the action' do
      before { controller.params = {:button => 'cancel', :id => aggregate.id} }

      it 'calls flash_and_redirect with appropriate arguments' do
        expect(controller).to receive(:flash_and_redirect).with(_("Edit of Host Aggregate \"%{name}\" was cancelled by the user") % {:name => aggregate.name})
        controller.send(:update)
      end
    end
  end

  describe '#update_finished' do
    let(:miq_task) { double("MiqTask", :state => 'Finished', :status => status, :message => 'some message') }
    let(:status) { 'Error' }

    before do
      allow(MiqTask).to receive(:find).with(123).and_return(miq_task)
      allow(controller).to receive(:session).and_return(:async => {:params => {:task_id => 123, :id => aggregate.id, :name => aggregate.name}})
    end

    it 'calls flash_and_redirect with appropriate arguments' do
      expect(controller).to receive(:flash_and_redirect).with(_("Unable to update Host Aggregate \"%{name}\": %{details}") % {
        :name    => aggregate.name,
        :details => miq_task.message
      }, :error)
      controller.send(:update_finished)
    end

    context 'succesful update of Host Aggregate' do
      let(:status) { 'ok' }

      it 'calls flash_and_redirect with appropriate arguments' do
        expect(controller).to receive(:flash_and_redirect).with(_("Host Aggregate \"%{name}\" updated") % {:name => aggregate.name})
        controller.send(:update_finished)
      end
    end
  end

  describe "#delete_host_aggregates" do
    let(:params) { {:id => aggregate.id.to_s} }

    before do
      allow(controller).to receive(:redirect_to)
      controller.instance_variable_set(:@breadcrumbs, [{:url => 'some_url'}])
      controller.instance_variable_set(:@lastaction, 'show_list')
      controller.params = params
    end

    it 'calls process_host_aggregates with selected Host Aggregates' do
      expect(controller).to receive(:process_host_aggregates).with([aggregate], 'destroy')
      controller.send(:delete_host_aggregates)
    end

    it 'sets flash message and redirects properly' do
      expect(controller).to receive(:flash_to_session)
      expect(controller).to receive(:redirect_to).with('some_url')
      controller.send(:delete_host_aggregates)
      expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => "Delete initiated for 1 Host Aggregate.", :level => :success}])
    end

    context 'Host Aggregates displayed in a nested list' do
      let(:params) { {:miq_grid_checks => aggregate.id.to_s} }

      before { controller.instance_variable_set(:@lastaction, nil) }

      it 'sets flash message and redirects to last url' do
        expect(controller).to receive(:flash_to_session)
        expect(controller).to receive(:redirect_to).with('some_url')
        controller.send(:delete_host_aggregates)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => "Delete initiated for 1 Host Aggregate.", :level => :success}])
      end
    end

    context 'textual summary of Host Aggregate' do
      before do
        controller.instance_variable_set(:@breadcrumbs, [{:url => 'some_previous_url'}, {:url => 'some_url'}])
        controller.instance_variable_set(:@lastaction, 'show')
        controller.instance_variable_set(:@layout, 'host_aggregate')
      end

      it 'sets flash message and redirects to previous url' do
        expect(controller).to receive(:redirect_to).with('some_previous_url')
        controller.send(:delete_host_aggregates)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => "Delete initiated for 1 Host Aggregate.", :level => :success}])
      end
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
        :args        => [host.id]
      }
    end

    it "builds add host screen" do
      post :button, :params => { :pressed => "host_aggregate_add_host", :format => :js, :id => aggregate.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the add host action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :add_host, :params => { :button => "addHost", :format => :js, :id => aggregate.id, :host_id => host.id }
    end

    context 'canceling the action' do
      before { controller.params = {:button => 'cancel', :id => aggregate.id} }

      it 'calls flash_and_redirect with appropriate arguments' do
        expect(controller).to receive(:flash_and_redirect).with(_("Add Host to Host Aggregate \"%{name}\" was cancelled by the user") % {:name => aggregate.name})
        controller.send(:add_host)
      end
    end
  end

  describe '#add_host_select' do
    before do
      controller.instance_variable_set(:@breadcrumbs, [{:url => 'previous_url'}, {:url => 'last_url'}])
      controller.params = {:id => aggregate.id}
    end

    it 'calls redirect_to with last url' do
      expect(controller).to receive(:redirect_to).with('last_url')
      controller.send(:add_host_select)
    end
  end

  describe '#add_host_finished' do
    let(:miq_task) { double("MiqTask", :state => 'Finished', :status => status, :message => 'some message') }
    let(:status) { 'Error' }

    before do
      allow(MiqTask).to receive(:find).with(123).and_return(miq_task)
      allow(controller).to receive(:session).and_return(:async => {:params => {:task_id => 123, :id => aggregate.id, :name => aggregate.name, :host_id => host.id}})
    end

    it 'calls flash_and_redirect with appropriate arguments' do
      expect(controller).to receive(:flash_and_redirect).with(_("Unable to update Host Aggregate \"%{name}\": %{details}") % {
        :name    => aggregate.name,
        :details => miq_task.message
      }, :error)
      controller.send(:add_host_finished)
    end

    context 'succesful adding Host to Host Aggregate' do
      let(:status) { 'ok' }

      it 'calls flash_and_redirect with appropriate arguments' do
        expect(controller).to receive(:flash_and_redirect).with(_("Host \"%{hostname}\" added to Host Aggregate \"%{name}\"") % {
          :hostname => host.name,
          :name     => aggregate.name
        })
        controller.send(:add_host_finished)
      end
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
        :args        => [host.id]
      }
    end

    it "builds remove host screen" do
      post :button, :params => { :pressed => "host_aggregate_remove_host", :format => :js, :id => aggregate.id }
      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the remove host action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))
      post :remove_host, :params => {
        :button  => "removeHost",
        :format  => :js,
        :id      => aggregate.id,
        :host_id => host.id
      }
    end

    context 'canceling the action' do
      before { controller.params = {:button => 'cancel', :id => aggregate.id} }

      it 'calls flash_and_redirect with appropriate arguments' do
        expect(controller).to receive(:flash_and_redirect).with(_("Remove Host from Host Aggregate \"%{name}\" was cancelled by the user") % {:name => aggregate.name})
        controller.send(:remove_host)
      end
    end
  end

  describe '#remove_host_select' do
    before do
      controller.instance_variable_set(:@breadcrumbs, [{:url => 'previous_url'}, {:url => 'last_url'}])
      controller.params = {:id => aggregate.id}
    end

    it 'calls redirect_to with last url' do
      expect(controller).to receive(:redirect_to).with('last_url')
      controller.send(:remove_host_select)
    end
  end

  describe '#remove_host_finished' do
    let(:miq_task) { double("MiqTask", :state => 'Finished', :status => status, :message => 'some message') }
    let(:status) { 'Error' }

    before do
      allow(MiqTask).to receive(:find).with(123).and_return(miq_task)
      allow(controller).to receive(:session).and_return(:async => {:params => {:task_id => 123, :id => aggregate.id, :name => aggregate.name, :host_id => host.id}})
    end

    it 'calls flash_and_redirect with appropriate arguments' do
      expect(controller).to receive(:flash_and_redirect).with(_("Unable to update Host Aggregate \"%{name}\": %{details}") % {
        :name    => aggregate.name,
        :details => miq_task.message
      }, :error)
      controller.send(:remove_host_finished)
    end

    context 'succesful removing Host from Host Aggregate' do
      let(:status) { 'ok' }

      it 'calls flash_and_redirect with appropriate arguments' do
        expect(controller).to receive(:flash_and_redirect).with(_("Host \"%{hostname}\" removed from Host Aggregate \"%{name}\"") % {
          :hostname => host.name,
          :name     => aggregate.name
        })
        controller.send(:remove_host_finished)
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
