require 'shared/helpers/application_helper/buttons/vm_console'

describe ApplicationHelper::Button::VmVncConsole do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#visible?' do
    context 'when record.vendor is vmware' do
      let(:record) { FactoryGirl.create(:vm_vmware) }
      include_context 'ApplicationHelper::Button::VmConsole#visible?',
                      :console_type       => 'VNC',
                      :support_of_records => {:vm_vmware => true}
    end
    context 'when record.vendor is not vmware' do
      context 'and VNC is a supported console' do
        include_context 'ApplicationHelper::Button::VmConsole#visible?',
                        :console_type       => 'VNC',
                        :support_of_records => {:vm_openstack => true, :vm_redhat => true}
      end
      context 'and VNC is not a supported console' do
        include_context 'ApplicationHelper::Button::VmConsole#visible?',
                        :console_type       => nil,
                        :support_of_records => {:vm_amazon => false}
      end
    end
  end

  describe '#calculate_properties?' do
    before { allow(record).to receive(:current_state).and_return(power_state) }
    before(:each) { subject.calculate_properties }

    context 'when record.vendor is vmware' do
      let(:power_state) { 'on' }
      let(:ems) { FactoryGirl.create(:ems_vmware, :api_version => api_version) }
      let(:record) { FactoryGirl.create(:vm_vmware, :ems_id => ems.id) }

      context 'and vendor api is not supported' do
        let(:api_version) { 6.5 }
        include_examples 'ApplicationHelper::Button::Basic disabled',
                         :error_message => 'VNC consoles are unsupported on VMware ESXi 6.5 and later.'
      end
      context 'and vendor api is supported' do
        let(:api_version) { 6.4 }
        include_examples 'ApplicationHelper::Button::VmConsole power state',
                         :error_message => 'The web-based VNC console is not available because the VM is not powered on'
      end
    end
  end
end
