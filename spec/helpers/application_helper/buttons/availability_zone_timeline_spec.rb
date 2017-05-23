require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::AvailabilityZoneTimeline do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    before { allow(record).to receive(:has_events?).and_return(has_events) }
    before(:each) { subject.calculate_properties }

    context 'and record has events' do
      let(:has_events) { true }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end

    context 'and record has not events' do
      let(:has_events) { false }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'No Timeline data has been collected for this Availability Zone'
    end
  end
end
