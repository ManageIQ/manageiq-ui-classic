describe CloudTenantController do
  let(:classification) { FactoryBot.create(:classification, :name => "department", :description => "Department") }
  let(:tag1) { FactoryBot.create(:classification_tag, :name => "tag1", :parent => classification) }
  let(:tag2) { FactoryBot.create(:classification_tag, :name => "tag2", :parent => classification) }
  let(:ct) { FactoryBot.create(:cloud_tenant, :name => "cloud-tenant-01") }
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

    it "renders listnav partial" do
      get :show, :params => {:id => tenant.id, :display => 'main'}

      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => "layouts/listnav/_cloud_tenant")
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
        :class_name  => CloudTenant.class_by_ems(ems),
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
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)

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
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)

      post :update, :params => { :button => "save", :format => :js, :id => tenant.id, :name => "foo" }
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
      expect(MiqTask).to receive(:generic_action_with_callback).with(task_options, queue_options)

      post :button, :params => { :id => tenant.id, :pressed => "cloud_tenant_delete", :format => :js }
    end
  end

  include_examples '#download_summary_pdf', :cloud_tenant

  it_behaves_like "controller with custom buttons"
end
