shared_examples_for 'a timeline button' do |options|
  describe '#disabled?' do
    before do
      allow(record).to receive(:has_events?).and_return(has_events)
    end

    %i(ems_events policy_events).each do |event_type|
      context "record has #{event_type}" do
        let(:has_events) { true }
        it_behaves_like 'an enabled button'
      end
    end
    context 'record has no ems_events or policy_events' do
      let(:has_events) { false }
      it_behaves_like 'a disabled button',
                      options[:error_message] || "No Timeline data has been collected for this #{options[:entity]}"
    end
  end
end
