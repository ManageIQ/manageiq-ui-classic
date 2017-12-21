describe ApplicationHelper::Button::EmsRefresh do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryGirl.create(:ems_infra) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    subject { button[:title] }
    before { allow(record).to receive(:authentication_status).and_return(auth_status) }

    context 'and record authentication status is valid' do
      let(:auth_status) { "Valid" }
      it { expect(button.disabled?).to be_falsey }
    end

    context 'and record authentication status is not valid' do
      let(:auth_status) { "Invalid" }
      it { expect(button.disabled?).to be_truthy }
    end
  end
end
