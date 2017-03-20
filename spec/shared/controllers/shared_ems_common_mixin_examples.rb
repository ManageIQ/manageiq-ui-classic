shared_examples :ems_common_button_examples do
  let!(:user) { stub_user(:features => :all) }

  let(:ems)     { FactoryGirl.create(:ext_management_system) }
  let(:ems_v)   { FactoryGirl.create(:ems_vmware) }
  let(:ems_a)   { FactoryGirl.create(:ems_amazon) }
  let(:storage) { FactoryGirl.create(:storage) }

  let(:vm) do
    FactoryGirl.create(:vm_vmware, :ext_management_system => ems_v, :storage => storage)
  end

  let(:ost) do
    FactoryGirl.create(:orchestration_stack_cloud, :ext_management_system => ems_a)
  end

  before do
    EvmSpecHelper.create_guid_miq_server_zone unless defined?(server)
  end

  include_examples :ems_cluster_button_examples
  include_examples :host_button_method_call_examples
  include_examples :storage_button_examples

  %w(
    host_aggregate_edit
    cloud_tenant_edit
    cloud_volume_edit
    custom_button
  ).each do |pressed|
    it "handles #{pressed}" do
      expect(controller).to receive("handle_#{pressed}".to_sym)
      post :button, { :pressed => pressed, :format => :js }
    end
  end

  %w(
    ems_cloud_recheck_auth_status
    ems_infra_recheck_auth_status
    ems_middleware_recheck_auth_status
    ems_container_recheck_auth_status
    ems_physical_infra_recheck_auth_status
  ).each do |pressed|
    it "handles #{pressed}" do
      expect(controller).to receive(:recheck_auth_status)
      post :button, { :pressed => pressed, :format => :js }
    end
  end

  it "handles when Retire Button is pressed for a Cloud provider Instance" do
    allow(controller).to receive(:role_allows?).and_return(true)

    post :button, :params => { :pressed => "instance_retire", "check_#{vm.id}" => "1", :format => :js, :id => ems_v.id, :display => 'instances' }
    expect(response.status).to eq 200
    expect(response.body).to include('vm/retire')
  end

  it "handles when Retire Button is pressed for an Orchestration Stack" do
    allow(controller).to receive(:role_allows?).and_return(true)

    post_params = {
      :pressed          => "orchestration_stack_retire",
      :display          => 'orchestration_stacks',
      :id               => ems_a.id,
      :format           => :js,
      "check_#{ost.id}" => "1"
    }

    post :button, :params => post_params
    expect(response.status).to eq 200
    expect(response.body).to include('orchestration_stack/retire')
  end

  it "handles when Delete Button is pressed for CloudObjectStoreContainer" do
    expect(controller).to receive(:process_cloud_object_storage_buttons)
    post :button, :params => { :pressed => "cloud_object_store_container_delete" }
  end

  it "handles when VM Migrate is pressed for unsupported type" do
    allow(controller).to receive(:role_allows?).and_return(true)
    vm = FactoryGirl.create(:vm_microsoft)
    post :button, :params => { :pressed => "vm_migrate", :format => :js, "check_#{vm.id}" => "1" }
    expect(controller.send(:flash_errors?)).to be_truthy
    expect(assigns(:flash_array).first[:message]).to include('does not apply')
  end

  it "handles when VM Migrate is pressed for supported type" do
    allow(controller).to receive(:role_allows?).and_return(true)
    vm = FactoryGirl.create(:vm_vmware, :storage => storage, :ext_management_system => ems)
    post :button, :params => { :pressed => "vm_migrate", :format => :js, "check_#{vm.id}" => "1" }
    expect(controller.send(:flash_errors?)).not_to be_truthy
  end

  it "handles when VM Migrate is pressed for supported type" do
    allow(controller).to receive(:role_allows?).and_return(true)
    vm = FactoryGirl.create(:vm_vmware)
    post :button, :params => { :pressed => "vm_edit", :format => :js, "check_#{vm.id}" => "1" }
    expect(controller.send(:flash_errors?)).not_to be_truthy
  end
end
