describe ApplicationHelper::Button::VmHtml5Console do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#visible?' do
    subject { button.visible? }

    context("html5_console supported") do
      before { stub_supports(record, :html5_console) }
      it { is_expected.to be_truthy }
    end

    context("html5_console supported") do
      before { stub_supports_not(record, :html5_console) }
      it { is_expected.to be_falsey }
    end
  end

  describe '#disabled?' do
    subject { button.disabled? }
    before { allow(record).to receive(:power_state).and_return(state) }

    context 'VM is on' do
      let(:state) { 'on' }

      it { is_expected.to be_falsey }
    end

    context 'VM is off' do
      let(:state) { 'off' }

      it { is_expected.to be_truthy }
    end
  end
end
