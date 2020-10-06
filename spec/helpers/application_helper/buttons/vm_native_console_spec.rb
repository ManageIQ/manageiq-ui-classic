describe ApplicationHelper::Button::VmNativeConsole do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:ems) { FactoryBot.create(:ems_redhat) }
  let(:record) { FactoryBot.create(:vm_redhat, :ext_management_system => ems) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#visible?' do
    subject { button.visible? }

    it { is_expected.to be true }
  end

  describe '#calculate_properties' do
    before(:each) do
      remote_console_validation
      button.calculate_properties
    end

    context 'and remote control is supported' do
      let(:remote_console_validation) do
        allow(record).to receive(:validate_native_console_support).and_return(true)
      end
      it_behaves_like 'an enabled button'
    end
    context 'and remote control is not supported' do
      let(:err_msg) { 'Remote console is not supported' }
      let(:remote_console_validation) do
        allow(record).to receive(:validate_native_console_support)
          .and_raise(MiqException::RemoteConsoleNotSupportedError, err_msg)
      end
      it_behaves_like 'a disabled button', "VM Native Console error: Remote console is not supported"
    end
  end
end
