describe ApplicationHelper::Button::HostTimeline do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    subject { button[:title] }
    before { allow(record).to receive(:has_events?).and_return(has_events) }

    context 'and record has events' do
      let(:has_events) { true }
      it_behaves_like 'an enabled button'
    end

    context 'and record has not events' do
      let(:has_events) { false }
      it_behaves_like 'a disabled button',
                      'No Timeline data has been collected for this Host'
    end
  end
end
