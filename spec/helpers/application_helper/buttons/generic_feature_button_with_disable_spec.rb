require 'shared/helpers/application_helper/buttons/generic_feature_button_with_disabled'

describe ApplicationHelper::Button::GenericFeatureButtonWithDisable do
  include_context 'ApplicationHelper::Button::GenericFeatureButton'
  let(:record) { FactoryGirl.create(:vm_vmware) }
  let(:feature) { :evacuate }

  describe '#visible?' do
    include_context 'ApplicationHelper::Button::GenericFeatureButton#visible?'
  end

  describe '#calculate_properties' do
    include_context 'ApplicationHelper::Button::GenericFeatureButtonWithDisabled#calculate_properties'
  end
end
