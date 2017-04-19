require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::HostPerformance do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    before { allow(record).to receive(:has_perf_data?).and_return(has_perf_data) }
    before(:each) { subject.calculate_properties }

    context 'and record has performance data' do
      let(:has_perf_data) { true }
      it_behaves_like 'an enabled button'
    end

    context 'and record has not performance data' do
      let(:has_perf_data) { false }
      it_behaves_like 'a disabled button',
                      'No Capacity & Utilization data has been collected for this Host'
    end
  end
end
