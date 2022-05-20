describe ApplicationHelper::Button::VmVmrcConsole do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm_vmware) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#visible?' do
    it_behaves_like 'vm_console_visible?', 'VMRC'
  end

  describe '#disabled?' do
    context 'and remote control is supported' do
      let!(:remote_console_validation) do
        allow(record).to receive(:validate_remote_console_vmrc_support).and_return(true)
      end
      it_behaves_like 'an enabled button'
    end
    context 'and remote control is not supported' do
      let(:err_msg) { 'Remote console is not supported' }
      let!(:remote_console_validation) do
        allow(record).to receive(:validate_remote_console_vmrc_support)
          .and_raise(MiqException::RemoteConsoleNotSupportedError, err_msg)
      end
      it_behaves_like 'a disabled button', "VM VMRC Console error: Remote console is not supported"
    end
  end
end
