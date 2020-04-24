describe CloudTenantController do
  let(:classification) { FactoryBot.create(:classification) }
  let(:tag1) { FactoryBot.create(:classification_tag, :parent => classification) }
  let(:tag2) { FactoryBot.create(:classification_tag, :parent => classification) }
  let(:ct) { FactoryBot.create(:cloud_tenant) }
  let(:ems) { FactoryBot.create(:ems_openstack) }
  let(:tenant) { FactoryBot.create(:cloud_tenant_openstack, :ext_management_system => ems) }

  before do
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
  end

  describe "#button" do
    it "when Instance Retire button is pressed" do
      expect(controller).to receive(:retirevms).once

      post :button, :params => { :pressed => "instance_retire", :format => :js }

      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Instance Tag is pressed" do
      expect(controller).to receive(:tag).with(VmOrTemplate)

      post :button, :params => { :pressed => "instance_tag", :format => :js }

      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    context 'Shelve offload applied on Instances displayed in a nested list' do
      before do
        controller.params = {:pressed => 'instance_shelve_offload'}
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:show)
      end

      it 'calls shelveoffloadvms' do
        expect(controller).to receive(:shelveoffloadvms)
        controller.send(:button)
      end
    end

    context 'Check Compliance of Last Known Configuration on Instances' do
      let(:vm_instance) { FactoryBot.create(:vm_or_template) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:drop_breadcrumb)
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'instances')
        controller.params = {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => tenant.id.to_s, :controller => 'cloud_tenant'}
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

  describe "#tags_edit" do
    before do
      session[:tag_db] = "CloudTenant"
      session[:edit] = {
        :key        => "CloudTenant_edit_tags__#{ct.id}",
        :tagging    => "CloudTenant",
        :object_ids => [ct.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [tag1.id, tag2.id]}
      }
    end

    it "builds tagging screen" do
      post :button, :params => { :pressed => "cloud_tenant_tag", :format => :js, :id => ct.id }

      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      session[:breadcrumbs] = [{:url => "cloud_tenant/show/#{ct.id}"}, 'placeholder']

      post :tagging_edit, :params => { :button => "cancel", :format => :js, :id => ct.id }

      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "save tags" do
      session[:breadcrumbs] = [{:url => "cloud_tenant/show/#{ct.id}"}, 'placeholder']
      post :tagging_edit, :params => { :button => "save", :format => :js, :id => ct.id, :data => get_tags_json([tag1, tag2]) }
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end
  end

  describe "#show" do
    let(:tenant) { FactoryBot.create(:cloud_tenant) }

    before { login_as FactoryBot.create(:user, :features => "none") }

    render_views

    it "renders dashboard" do
      get :show, :params => {:id => tenant.id}

      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => "cloud_tenant/_show_dashboard")
    end

    it "renders show" do
      get :show, :params => {:id => tenant.id, :display => 'main'}

      expect(response.status).to eq(200)
    end
  end

  describe "#create" do
    let(:tenant) { FactoryBot.create(:cloud_tenant_openstack) }
    let(:task_options) do
      {
        :action => "creating Cloud Tenant for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => CloudTenant.class_by_ems(ems).name,
        :method_name => "create_cloud_tenant",
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => [ems.id, {:name => "foo" }]
      }
    end

    it "builds create screen" do
      post :button, :params => { :pressed => "cloud_tenant_new", :format => :js }

      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the create action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))

      post :create, :params => { :button => "add", :format => :js, :name => 'foo', :ems_id => ems.id }
    end
  end

  describe "#edit" do
    let(:task_options) do
      {
        :action => "updating Cloud Tenant for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => tenant.class.name,
        :method_name => "update_cloud_tenant",
        :instance_id => tenant.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => [{:name => "foo"}]
      }
    end

    it "builds edit screen" do
      post :button, :params => { :pressed => "cloud_tenant_edit", :format => :js, :id => tenant.id }

      expect(assigns(:flash_array)).to be_nil
    end

    it "queues the update action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, a_hash_including(queue_options))

      post :update, :params => { :button => "save", :format => :js, :id => tenant.id, :name => "foo" }
    end
  end

  describe '#update' do
    before do
      allow(controller).to receive(:assert_privileges)
      controller.params = {:button => 'cancel', :id => tenant.id}
    end

    it 'calls flash_and_redirect for canceling editing Cloud Tenant' do
      expect(controller).to receive(:flash_and_redirect).with(_("Edit of Cloud Tenant \"%{name}\" was cancelled by the user") % {:name => tenant.name})
      controller.send(:update)
    end
  end

  describe '#update_finished' do
    let(:miq_task) { double("MiqTask", :state => 'Finished', :status => 'ok', :message => 'some message') }

    before do
      allow(MiqTask).to receive(:find).with(123).and_return(miq_task)
      allow(controller).to receive(:session).and_return(:async => {:params => {:task_id => 123, :name => tenant.name}})
    end

    it 'calls flash_and_redirect with appropriate arguments for succesful updating of a Cloud Tenant' do
      expect(controller).to receive(:flash_and_redirect).with(_("Cloud Tenant \"%{name}\" updated") % {:name => tenant.name})
      controller.send(:update_finished)
    end

    context 'unsuccesful updating of a Cloud Tenant' do
      let(:miq_task) { double("MiqTask", :state => 'Finished', :status => 'Error', :message => 'some message') }

      it 'calls flash_and_redirect with appropriate arguments' do
        expect(controller).to receive(:flash_and_redirect).with(_("Unable to update Cloud Tenant \"%{name}\": %{details}") % {
          :name    => tenant.name,
          :details => miq_task.message
        }, :error)
        controller.send(:update_finished)
      end
    end
  end

  describe "#delete" do
    let(:task_options) do
      {
        :action => "deleting Cloud Tenant for user %{user}" % {:user => controller.current_user.userid},
        :userid => controller.current_user.userid
      }
    end
    let(:queue_options) do
      {
        :class_name  => tenant.class.name,
        :method_name => "delete_cloud_tenant",
        :instance_id => tenant.id,
        :priority    => MiqQueue::HIGH_PRIORITY,
        :role        => "ems_operations",
        :zone        => ems.my_zone,
        :args        => []
      }
    end

    it "queues the delete action" do
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, hash_including(queue_options))

      post :button, :params => { :id => tenant.id, :pressed => "cloud_tenant_delete", :format => :js }
    end
  end

  describe '#delete_cloud_tenants' do
    before do
      controller.params = {:miq_grid_checks => tenant.id.to_s}
      controller.instance_variable_set(:@breadcrumbs, [{:url => 'previous url'}, {:url => 'last url'}])
    end

    it 'calls flash_to_session and redirect_to with proper url while displaying nested list of Cloud Tenants' do
      expect(controller).to receive(:flash_to_session)
      expect(controller).to receive(:redirect_to).with('last url')
      controller.send(:delete_cloud_tenants)
    end

    context 'summary or dashboard of a Cloud Tenant' do
      %w[show show_dashboard].each do |lastaction|
        before { controller.instance_variable_set(:@lastaction, lastaction) }

        it 'calls flash_to_session and javascript_redirect' do
          expect(controller).to receive(:flash_to_session)
          expect(controller).to receive(:javascript_redirect).with('previous url')
          controller.send(:delete_cloud_tenants)
        end

        context 'flash errors' do
          before { allow(controller).to receive(:flash_errors?).and_return(true) }

          it 'calls render_flash' do
            expect(controller).to receive(:render_flash)
            controller.send(:delete_cloud_tenants)
          end
        end
      end
    end

    context 'list of Cloud Tenants' do
      before { controller.instance_variable_set(:@lastaction, 'show_list') }

      it 'calls show_list and render_flash, sets @refresh_partial' do
        expect(controller).to receive(:show_list)
        expect(controller).to receive(:render_flash)
        controller.send(:delete_cloud_tenants)
        expect(controller.instance_variable_get(:@refresh_partial)).to eq('layouts/gtl')
      end
    end
  end

  include_examples '#download_summary_pdf', :cloud_tenant

  it_behaves_like "controller with custom buttons"
end
