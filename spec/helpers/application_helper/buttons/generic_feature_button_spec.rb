require 'shared/helpers/application_helper/buttons/generic_feature_button'

describe ApplicationHelper::Button::GenericFeatureButton do
  include_context 'ApplicationHelper::Button::GenericFeatureButton'
  let(:record) { double }
  let(:feature) { :some_feature }

  describe '#visible?' do
    include_context 'ApplicationHelper::Button::GenericFeatureButton#visible?'
  end
end
