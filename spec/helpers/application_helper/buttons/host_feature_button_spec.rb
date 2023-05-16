describe ApplicationHelper::Button::HostFeatureButton do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:ems_openstack_infra) }
  let(:feature) { :standby }
  let(:props) { {:options => {:feature => feature}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }

  it_behaves_like 'a generic feature button after initialization'

  describe '#visible?' do
    subject { button.visible? }

    context 'when record.kind_of?(ManageIQ::Providers::Openstack::InfraManager)' do
      %w[start stop].each do |feature|
        context "and feature is #{feature}" do
          let(:feature) { feature }
          it { expect(subject).to be_truthy }
        end
      end
      context 'and feature is other than start or stop' do
        let(:feature) { :stand_by }
        it { expect(subject).to be_falsey }
      end
    end
    context 'when record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)' do
      let(:record) { FactoryBot.create(:host_openstack_infra) }
      context 'and feature is available' do
        let(:feature) { :stop }
        before { stub_supports(record, feature) }
        it { expect(subject).to be_truthy }
      end
      context 'and feature is unavailable' do
        let(:feature) { :shutdown }
        before { stub_supports_not(record, feature) }
        it { expect(subject).to be_falsey }
      end
    end
    context 'when there is no record' do
      let(:record) { nil }
      it { expect(subject).to be_truthy }
    end
    context 'when feature is nil' do
      let(:feature) { nil }
      it { expect(subject).to be_truthy }
    end
  end
end
