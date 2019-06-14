describe ApplicationHelper::Button::EmsRefresh do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:ems_vmware) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    subject { button[:title] }
    before { allow(record).to receive(:authentication_status).and_return(auth_status) }
    before { allow(record).to receive(:enabled?).and_return(enabled) }

    context 'provider is suspended' do
      let(:enabled) { false }
      let(:auth_status) { "Valid" }
      it { expect(button.disabled?).to be_truthy }
    end

    context 'and record authentication status is valid' do
      let(:enabled) { true }
      let(:auth_status) { "Valid" }
      it { expect(button.disabled?).to be_falsey }
    end

    context 'and record authentication status is not valid' do
      let(:enabled) { true }
      let(:auth_status) { "Invalid" }
      it { expect(button.disabled?).to be_truthy }
    end
  end
end
