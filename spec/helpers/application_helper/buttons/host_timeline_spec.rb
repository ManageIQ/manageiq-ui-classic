require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::HostTimeline do
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
      it_behaves_like 'an enabled button'
    end

    context 'and record has not events' do
      let(:has_events) { false }
      it_behaves_like 'a disabled button',
                      'No Timeline data has been collected for this Host'
    end
  end
end
