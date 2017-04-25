require 'shared/helpers/application_helper/buttons/basic'

shared_context 'ApplicationHelper::Button::Timeline#calculate_properties' do |entity|
  before do
    allow(record).to receive(:has_events?).and_return(has_events)
    subject.calculate_properties
  end

  %i(ems_events policy_events).each do |event_type|
    context "record has #{event_type}" do
      let(:has_events) { true }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
  end
  context 'record has no ems_events or policy_events' do
    let(:has_events) { false }
    include_examples 'ApplicationHelper::Button::Basic disabled',
                     "No Timeline data has been collected for this #{entity}"
  end
end
