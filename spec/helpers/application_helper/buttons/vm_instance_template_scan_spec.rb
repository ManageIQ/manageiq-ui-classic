describe ApplicationHelper::Button::VmInstanceTemplateScan do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm_or_template) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#visible?' do
    subject { button.visible? }

    context 'when record supports smartstate analysis' do
      before { stub_supports(record, :smartstate_analysis) }
      context 'when record has proxy' do
        before { allow(record).to receive(:has_proxy?).and_return(true) }
        it { is_expected.to be_truthy }
      end

      context 'when record does not have proxy' do
        before { allow(record).to receive(:has_proxy?).and_return(false) }
        it { is_expected.to be_falsey }
      end
    end

    context 'when record does not support smartstate analysis' do
      before { stub_supports_not(record, :smartstate_analysis) }
      it { is_expected.to be_falsey }
    end
  end

  describe '#disabled?' do
    let(:has_active_proxy?) { true }
    before do
      EvmSpecHelper.local_guid_miq_server_zone
      allow(record).to receive(:has_active_proxy?).and_return(has_active_proxy?)
    end

    context 'when smart_roles are enabled' do
      before do
        roles = %w(smartproxy smartstate).collect { |role| FactoryBot.create(:server_role, :name => role) }
        FactoryBot.create(:miq_server, :zone => MiqServer.my_server.zone, :active_roles => roles)
      end

      context 'when record has active proxy' do
        it_behaves_like 'an enabled button'
      end
      context 'when record does not have active proxy' do
        let(:has_active_proxy?) { false }
        it_behaves_like 'a disabled button', 'No active SmartProxies found to analyze this VM'
      end
    end
  end
end
