require 'shared/helpers/application_helper/buttons/vm_console'

describe ApplicationHelper::Button::VmWebmksConsole do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#visible?' do
    context 'when record.vendor is vmware' do
      let(:record) { FactoryGirl.create(:vm_vmware) }
      include_context 'ApplicationHelper::Button::VmConsole#visible?',
                      :console_type       => 'WebMKS',
                      :support_of_records => {:vm_vmware => true}
    end
    context 'when record.vendor is not vmware' do
      context 'and WebMKS is not a supported console' do
        include_context 'ApplicationHelper::Button::VmConsole#visible?',
                        :console_type       => nil,
                        :support_of_records => {:vm_openstack => nil, :vm_redhat => nil}
      end
    end
  end

  describe '#calculate_properties?' do
    before { allow(record).to receive(:current_state).and_return(power_state) }
    before(:each) { subject.calculate_properties }

    context 'when record.vendor is vmware' do
      let(:power_state) { 'on' }
      let(:ems) { FactoryGirl.create(:ems_vmware) }
      let(:record) { FactoryGirl.create(:vm_vmware, :ems_id => ems.id) }

      context 'and the power is on' do
        include_examples 'ApplicationHelper::Button::VmConsole power state',
                         :error_message => 'The web-based WebMKS console is not available because the VM is not powered on'
      end
    end
  end
end
