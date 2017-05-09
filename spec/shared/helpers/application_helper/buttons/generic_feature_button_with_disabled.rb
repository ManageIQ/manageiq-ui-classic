require 'shared/helpers/application_helper/buttons/generic_feature_button'

shared_context 'ApplicationHelper::Button::GenericFeatureButtonWithDisabled#calculate_properties' do
  let(:available) { true }
  before do
    allow(record).to receive(:is_available?).with(feature).and_return(available)
    allow(record).to receive(:is_available_now_error_message).and_return('unavailable')
    allow(record).to receive(:supports?).with(feature).and_return(support) if defined? support
    subject.calculate_properties
  end

  context 'when feature exists' do
    let(:feature) { :evacuate }
    context 'and feature is supported' do
      let(:support) { true }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
    context 'and feature is not supported' do
      let(:support) { false }
      include_examples 'ApplicationHelper::Button::Basic disabled', :error_message => 'Feature not available/supported'
    end
  end
  context 'when feature is unknown' do
    let(:feature) { :non_existent_feature }
    context 'and feature is not available' do
      let(:available) { false }
      include_examples 'ApplicationHelper::Button::Basic disabled', :error_message => 'unavailable'
    end
    context 'but feature is available' do
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
  end
end
