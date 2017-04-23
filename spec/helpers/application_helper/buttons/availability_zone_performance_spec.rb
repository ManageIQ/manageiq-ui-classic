require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::AvailabilityZonePerformance do
  include_examples 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    before { allow(record).to receive(:has_perf_data?).and_return(has_perf_data) }
    before(:each) { button.calculate_properties }

    context 'and record has events' do
      let(:has_perf_data) { true }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end

    context 'and record has not events' do
      let(:has_perf_data) { false }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                      'No Capacity & Utilization data has been collected for this Availability Zone'
    end
  end
end
