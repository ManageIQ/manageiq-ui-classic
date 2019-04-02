describe ApplicationHelper::Button::EmsClusterPerformance do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:vm) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    subject { button[:title] }
    before { allow(record).to receive(:has_perf_data?).and_return(has_perf_data) }
    before { button.calculate_properties }

    context 'and record has events' do
      let(:has_perf_data) { true }
      it_behaves_like 'an enabled button'
    end

    context 'and record has not events' do
      let(:has_perf_data) { false }
      it_behaves_like 'a disabled button',
                      'No Capacity & Utilization data has been collected for this Cluster'
    end
  end
end
