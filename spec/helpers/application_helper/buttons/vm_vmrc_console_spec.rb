require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::VmVmrcConsole do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm_vmware) }

  describe '#visible?' do
    it_behaves_like 'vm_console_visible?', 'VMRC'
  end

  describe '#calculate_properties' do
    before do
      remote_console_validation
      subject.calculate_properties
    end

    context 'and remote control is supported' do
      let(:remote_console_validation) do
        allow(record).to receive(:validate_remote_console_vmrc_support).and_return(true)
      end
      it_behaves_like 'an enabled button'
    end
    context 'and remote control is not supported' do
      let(:err_msg) { 'Remote console is not supported' }
      let(:remote_console_validation) do
        allow(record).to receive(:validate_remote_console_vmrc_support)
          .and_raise(MiqException::RemoteConsoleNotSupportedError, err_msg)
      end
      it_behaves_like 'a disabled button', "VM VMRC Console error: Remote console is not supported"
    end
  end
end
