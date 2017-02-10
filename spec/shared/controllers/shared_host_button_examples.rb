
shared_examples :common_host_button_examples do
  # host_scan
  # host_check_compliance
  # host_refresh
  # host_protect
  # host_edit
  # host_delete

  before do
    EvmSpecHelper.create_guid_miq_server_zone unless defined?(server)
  end

  let(:host)  { FactoryGirl.create(:host) }
  let(:host2) { FactoryGirl.create(:host) }

  let(:checked_hosts) do
    [host.id, host2.id].map{ |id| ApplicationRecord.compress_id(id) }.join(",")
  end

  %w(host_protect host_edit).each do |pressed|
    it "handles #{pressed}" do
      expect(controller).to receive("handle_#{pressed}".to_sym).and_call_original
      post :button, :params => { :pressed => pressed, :format => :js, :id => host.id }
      expect(assigns(:flash_array)).to be_nil
    end
  end

  it 'handles host_delete' do
    expect(controller).to receive(:deletehosts).and_call_original
    post :button, :params => { :pressed => "host_delete", :format => :js, :id => host.id }
    expect(assigns(:flash_array).first[:message]).to match(/deleted/)
    expect(assigns(:flash_array).first[:level]).to eq(:success)
  end

  it 'handles host_scan' do
    expect(controller).to receive(:scanhosts).and_call_original
    post :button, :params => { :pressed => "host_scan", :format => :js, :id => host2.id, :miq_grid_checks => checked_hosts }
    expect(assigns(:flash_array).first[:message]).to match(/initiated/)
    expect(assigns(:flash_array).first[:level]).to eq(:success)
  end

  it 'handles host_refresh' do
    expect(controller).to receive(:refreshhosts).and_call_original
    post :button, :params => { :pressed => "host_refresh", :format => :js, :id => host.id, :miq_grid_checks => checked_hosts }
    expect(assigns(:flash_array).first[:message]).to match(/initiated/)
    expect(assigns(:flash_array).first[:level]).to eq(:success)
  end

  it "handles host_check_compliance" do
    expect(controller).to receive(:check_compliance_hosts).and_call_original
    expect(controller).to receive(:show)

    post :button, :params => { :pressed => "host_check_compliance", :format => :js, :id => host.id, :miq_grid_checks => checked_hosts}

    flash_array = assigns(:flash_array)
    expect(flash_array.first[:message]).to match(/successfully initiated/)
    expect(flash_array.first[:level]).to eq(:success)
  end
end

shared_examples :special_host_button_examples do
  # host_cloud_service_scheduling_toggle
  # host_compare
  # host_introspect
  # host_manageable
  # host_miq_request_new
  # host_provide
  # host_toggle_maintenance
  # host_analyze_check_compliance
  # host_tag

  before do
    EvmSpecHelper.create_guid_miq_server_zone unless defined?(server)
  end

  let(:host)  { FactoryGirl.create(:host) }
  let(:host2) { FactoryGirl.create(:host) }

  %w(
    host_delete
    host_edit
    host_introspect
    host_manageable
    host_provide
    new
  ).each do |pressed|
    it "handles #{pressed}" do
      expect(controller).to receive("handle_#{pressed}".to_sym)
      post :button, :params => { :pressed => pressed, :format => :js, :id => host.id }
    end
  end

  it "handles host_toggle_maintenance" do
    expect(controller).to receive(:maintenancehosts)
    post :button, :params => { :pressed => "host_toggle_maintenance", :format => :js, :id => host.id }
  end

  it "handles host_cloud_service_scheduling_toggle" do
    expect(controller).to receive(:toggleservicescheduling)
    post :button, :params => { :pressed => "host_cloud_service_scheduling_toggle", :format => :js, :id => host.id }
  end

  %w(
    host_compare
    host_miq_request_new
    host_protect
    host_refresh
    host_scan
  ).each do |pressed|
    it "handles #{pressed}" do
      expect(controller).to receive("handle_#{pressed}".to_sym)
      post :button, :params => { :pressed => pressed, :format => :js, :id => host.id }
      expect(assigns(:flash_array)).to be_nil
    end
  end

  it "handles host_tag" do
    expect(controller).to receive(:tag).with(Host).and_call_original
    post :button, :params => { :pressed => "host_tag", :id => host.id}
    expect(assigns(:flash_array)).to be_nil
  end

  it "handles host_analyze_check_compliance" do
    expect(controller).to receive(:analyze_check_compliance_hosts).and_call_original
    expect(controller).to receive(:show)

    post :button, :params => { :pressed => "host_analyze_check_compliance", :format => :js, :id => host.id}

    flash_array = assigns(:flash_array)
    expect(flash_array.first[:message]).to match(/successfully initiated/)
    expect(flash_array.first[:level]).to eq(:success)
  end
end

shared_examples :host_vm_button_examples do
  # vm_right_size
  # vm_migrate
  # vm_retire
  # vm_protect
  # miq_template_protect
  # vm_tag
  # miq_template_tag

  let(:host) { FactoryGirl.create(:host, :name => "Shared Example FooHost") }

  it "handles when VM Right Size Recommendations is pressed" do
    expect(controller).to receive(:vm_right_size)
    post :button, :params => { :pressed => "vm_right_size", :id => host.id}
    expect(assigns(:flash_array)).to be_nil
  end

  it "handles when VM Migrate is pressed" do
    expect(controller).to receive(:prov_redirect).with("migrate").and_call_original
    post :button, :params => { :pressed => "vm_migrate", :id => host.id}
    expect(assigns(:flash_array)).to be_nil
  end

  it "handles when VM Retire is pressed" do
    expect(controller).to receive(:retirevms).and_call_original
    post :button, :params => { :pressed => "vm_retire", :id => host.id}
    expect(assigns(:flash_array)).to be_nil
  end

  it "handles when VM Manage Policies is pressed" do
    expect(controller).to receive(:assign_policies).with(VmOrTemplate).and_call_original
    post :button, :params => { :pressed => "vm_protect", :id => host.id}
    expect(assigns(:flash_array)).to be_nil
  end

  it "handles when MiqTemplate Manage Policies is pressed" do
    expect(controller).to receive(:assign_policies).with(VmOrTemplate).and_call_original
    post :button, :params => { :pressed => "miq_template_protect", :id => host.id}
    expect(assigns(:flash_array)).to be_nil
  end

  it "handles when VM Tag is pressed" do
    expect(controller).to receive(:tag).with(VmOrTemplate).and_call_original
    post :button, :params => { :pressed => "vm_tag", :id => host.id}
    expect(assigns(:flash_array)).to be_nil
  end

  it "handles when MiqTemplate Tag is pressed" do
    expect(controller).to receive(:tag).with(VmOrTemplate).and_call_original
    post :button, :params => { :pressed => "miq_template_tag", :id => host.id}
    expect(assigns(:flash_array)).to be_nil
  end
end

shared_examples :host_power_button_examples do
  before do
    EvmSpecHelper.create_guid_miq_server_zone unless defined?(server)
  end

  let(:host)  { FactoryGirl.create(:host) }

  {
    "host_standby"  => "Enter Standby Mode",
    "host_shutdown" => "Shut Down",
    "host_reboot"   => "Restart",
    "host_start"    => "Power On",
    "host_stop"     => "Power Off",
    "host_reset"    => "Reset"
  }.each do |button, description|
    it "handles when Host #{description} button is pressed" do
      command = button.split('_', 2)[1]
      allow_any_instance_of(Host).to receive(:is_available?).with(command).and_return(true)
      controller.instance_variable_set(:@lastaction, "show_list")
      allow(controller).to receive(:show_list)

      post :button, :params => { :pressed => button, :miq_grid_checks => host.id.to_s}

      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("successfully initiated")
      expect(flash_messages.first[:level]).to eq(:success)
    end
  end
end

# Quick tests that only check if the method is called
shared_examples :host_button_method_call_examples do
  # Used in ems_common:
  # host_analyze_check_compliance
  # host_check_compliance
  # host_compare
  # host_delete
  # host_edit
  # host_protect
  # host_refresh
  # host_scan
  # host_manageable
  # host_introspect
  # host_provide

  it 'handles host_analyze_check_compliance' do
    expect(controller).to receive(:analyze_check_compliance_hosts)
    post :button, :params => { :pressed => "host_analyze_check_compliance", :format => :js }
  end

  it "handles host_check_compliance" do
    expect(controller).to receive(:check_compliance_hosts)
    post :button, :params => { :pressed => "host_check_compliance", :format => :js }
  end

  it "handles host_compare" do
    expect(controller).to receive(:comparemiq)
    post :button, :params => { :pressed => "host_compare", :format => :js }
  end

  it 'handles host_delete' do
    expect(controller).to receive(:deletehosts)
    post :button, :params => { :pressed => "host_delete", :format => :js }
  end

  it 'handles host_edit' do
    expect(controller).to receive(:edit_record)
    post :button, :params => { :pressed => "host_edit", :format => :js }
  end

  it 'handles host_protect' do
    expect(controller).to receive(:assign_policies).with(Host)
    post :button, :params => { :pressed => "host_protect", :format => :js }
  end

  it 'handles host_refresh' do
    expect(controller).to receive(:refreshhosts)
    post :button, :params => { :pressed => "host_refresh", :format => :js }
  end

  it "handles host_scan" do
    expect(controller).to receive(:scanhosts)
    post :button, :params => { :pressed => "host_scan", :format => :js }
  end

  it "handles host_manageable" do
    expect(controller).to receive(:sethoststomanageable)
    post :button, :params => { :pressed => "host_manageable", :format => :js }
  end

  it "handles host_introspect" do
    expect(controller).to receive(:introspecthosts)
    post :button, :params => { :pressed => "host_introspect", :format => :js }
  end

  it "handles host_provide" do
    expect(controller).to receive(:providehosts)
    post :button, :params => { :pressed => "host_provide", :format => :js }
  end
end
