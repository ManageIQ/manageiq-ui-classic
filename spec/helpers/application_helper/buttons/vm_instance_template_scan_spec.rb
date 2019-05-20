describe ApplicationHelper::Button::VmInstanceTemplateScan do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm_or_template) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#visible?' do
    let(:has_proxy?) { true }
    subject { button.visible? }
    before do
      allow(record).to receive(:supports?).with(:smartstate_analysis).and_return(supports_feature?)
      allow(record).to receive(:has_proxy?).and_return(has_proxy?)
    end

    context 'when record supports smartstate analysis' do
      let(:supports_feature?) { true }
      context 'when record has proxy' do
        it { is_expected.to be_truthy }
      end
      context 'when record does not have proxy' do
        let(:has_proxy?) { false }
        it { is_expected.to be_falsey }
      end
    end
    context 'when record does not support smartstate analysis' do
      let(:supports_feature?) { false }
      it { is_expected.to be_falsey }
    end
  end

  describe '#calculate_properties' do
    let(:has_active_proxy?) { true }
    before do
      EvmSpecHelper.local_guid_miq_server_zone
      allow(record).to receive(:has_active_proxy?).and_return(has_active_proxy?)
    end

    context 'when smart_roles are enabled' do
      before do
        roles = ServerRole.where(:name => %w(smartproxy smartstate))
        FactoryBot.create(:miq_server, :zone => MiqServer.my_server.zone, :active_roles => roles)
        button.calculate_properties
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
