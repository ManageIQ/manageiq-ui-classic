describe ApplicationHelper::Button::VmWebmksConsole do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#visible?' do
    subject { button.visible? }
    context 'when record.vendor == vmware' do
      let(:record) { FactoryGirl.create(:vm_vmware) }
      it_behaves_like 'vm_console_visible?', 'WebMKS', :vm_vmware => true
    end
    context 'when record.vendor != vmware' do
      context 'and WebMKS is not a supported console' do
        it_behaves_like 'vm_console_record_types', :vm_openstack => nil, :vm_redhat => nil
      end
    end
  end

  describe '#calculate_properties?' do
    before do
      allow(record).to receive(:current_state).and_return(power_state)
      allow(subject).to receive(:webmks_assets_provided?).and_return(true)
    end
    before(:each) { button.calculate_properties }

    context 'when record.vendor == vmware (infra)' do
      let(:power_state) { 'on' }
      let(:api_version) { 6.5 }
      let(:host) { FactoryGirl.create(:host_vmware_esx, :vmm_version => api_version) }
      let(:record) { FactoryGirl.create(:vm_vmware, :host => host) }

      context 'and the power is on' do
        it_behaves_like 'vm_console_with_power_state_on_off',
                        "The web-based WebMKS console is not available because the VM is not powered on"
      end

      context 'and the api version' do
        context 'is < 6' do
          let(:api_version) { 5.5 }
          it_behaves_like 'a disabled button',
                          'The web-based WebMKS console is not available because the VM does not support the minimum required vSphere API version.'
        end
        [6.0, 6.5].each do |ver|
          context "is #{ver}" do
            let(:api_version) { ver }
            it_behaves_like 'an enabled button'
          end

          context 'and Host is nil' do
            let(:host) { nil }
            it_behaves_like 'a disabled button',
                            'The web-based WebMKS console is not available because the VM does not support the minimum required vSphere API version.'
          end
        end
      end
    end

    context 'when record.vendor == vmware (cloud)' do
      let(:power_state) { 'on' }
      let(:api_version) { 5.5 }
      let(:ems) { FactoryGirl.create(:ems_vmware_cloud, :api_version => api_version) }
      let(:record) { FactoryGirl.create(:vm_vmware_cloud, :ext_management_system => ems) }

      context 'and the power is on' do
        it_behaves_like 'vm_console_with_power_state_on_off',
                        "The web-based WebMKS console is not available because the VM is not powered on"
      end

      context 'and the api version' do
        context 'is < 5.5' do
          let(:api_version) { 5.1 }
          it_behaves_like 'a disabled button',
                          'The web-based WebMKS console is not available because the VM does not support the minimum required vCloud API version 5.5.'
        end
        [5.5, 9.0].each do |ver|
          context "is #{ver}" do
            let(:api_version) { ver }
            it_behaves_like 'an enabled button'
          end

          context "#{ver} and ems is nil" do
            let(:ems) { nil }
            it_behaves_like 'a disabled button',
                            'The web-based WebMKS console is not available because the VM does not support the minimum required vCloud API version 5.5.'
          end
        end
      end
    end
  end
end
