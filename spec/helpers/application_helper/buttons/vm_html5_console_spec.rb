describe ApplicationHelper::Button::VmHtml5Console do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#visible?' do
    subject { button.visible? }

    SUPPORTED_CONSOLE_TYPES = %i[vnc spice webmks].freeze

    SUPPORTED_CONSOLE_TYPES.each do |type|
      context("#{type} console") do
        before do
          SUPPORTED_CONSOLE_TYPES.each do |t|
            allow(record).to receive(:console_supported?).with(t.to_s).and_return(t == type)
          end
        end

        it { is_expected.to be_truthy }
      end
    end

    it { is_expected.to be_falsey }
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
