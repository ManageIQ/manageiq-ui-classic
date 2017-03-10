describe ApplicationHelper::Button::VmVncConsole do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#visible?' do
    subject { button.visible? }
    context 'when record.vendor == vmware' do
      let(:record) { FactoryGirl.create(:vm_vmware) }
      it_behaves_like 'vm_console_visible?', 'VNC', :vm_vmware => true
    end
    context 'when record.vendor != vmware' do
      context 'and VNC is a supported console' do
        it_behaves_like 'vm_console_record_types', :vm_openstack => true, :vm_redhat => true
      end
      context 'and VNC is not a supported console' do
        it_behaves_like 'vm_console_record_types', :vm_amazon => false
      end
    end
  end

  describe '#calculate_properties?' do
    before { allow(record).to receive(:current_state).and_return(power_state) }
    before(:each) { button.calculate_properties }

    context 'when record.vendor == vmware' do
      let(:power_state) { 'on' }
      let(:ems) { FactoryGirl.create(:ems_vmware, :api_version => api_version) }
      let(:record) { FactoryGirl.create(:vm_vmware, :ems_id => ems.id) }

      context 'and vendor api is not supported' do
        let(:api_version) { 6.5 }
        it_behaves_like 'a disabled button', 'VNC consoles are unsupported on VMware ESXi 6.5 and later.'
      end
      context 'and vendor api is supported' do
        let(:api_version) { 6.4 }

        it_behaves_like 'vm_console_with_power_state_on_off', "The web-based VNC console is not available because \
the VM is not powered on"
      end
    end
  end
end
