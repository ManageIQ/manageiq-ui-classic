shared_examples_for 'a performance button' do |entity|
  describe '#disabled?' do
    before do
      record.metric_rollups << metric_rollup if metric_rollup
    end

    context 'when performance data has not been collected' do
      let(:metric_rollup) { nil }
      it_behaves_like 'a disabled button', "No Capacity & Utilization data has been collected for this #{entity}"
    end
    context 'when performance data are available' do
      let(:metric_rollup) { FactoryBot.create(:metric_rollup_storage_hr) }
      it_behaves_like 'an enabled button'
    end
  end
end
