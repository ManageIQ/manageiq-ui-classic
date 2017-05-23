require 'shared/helpers/application_helper/buttons/basic'

shared_context 'ApplicationHelper::Button::Perf#calculate_properties' do |options|
  before do
    record.metric_rollups << metric_rollup if metric_rollup
    subject.calculate_properties
  end

  context 'when performance data has not been collected' do
    let(:metric_rollup) { nil }
    include_examples 'ApplicationHelper::Button::Basic disabled',
                     :error_message => "No Capacity & Utilization data has been collected for this #{options[:entity]}"
  end
  context 'when performance data are available' do
    let(:metric_rollup) { FactoryGirl.create(:metric_rollup_storage_hr) }
    include_examples 'ApplicationHelper::Button::Basic enabled'
  end
end
