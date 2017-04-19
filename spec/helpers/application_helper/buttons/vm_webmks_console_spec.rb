require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::VmWebmksConsole do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

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
    before { allow(record).to receive(:current_state).and_return(power_state) }
    before(:each) { subject.calculate_properties }

    context 'when record.vendor == vmware' do
      let(:power_state) { 'on' }
      let(:ems) { FactoryGirl.create(:ems_vmware) }
      let(:record) { FactoryGirl.create(:vm_vmware, :ems_id => ems.id) }

      context 'and the power is on' do
        it_behaves_like 'vm_console_with_power_state_on_off',
                        "The web-based WebMKS console is not available because the VM is not powered on"
      end
    end
  end
end
