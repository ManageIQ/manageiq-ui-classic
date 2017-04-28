require 'shared/helpers/application_helper/buttons/new'

describe ApplicationHelper::Button::CustomizationTemplateNew do
  include_context 'ApplicationHelper::Button::New'
  let(:x_node) { 'root' }

  describe '#visible?' do
    include_context 'ApplicationHelper::Button::New#visible?'

    context 'when root node is active' do
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'when system node is active' do
      let(:x_node) { 'xx-xx-system' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'when other node is active' do
      let(:x_node) { 'xx-xx-10r3' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end

  describe '#calculate_properties' do
    before do
      allow(PxeImageType).to receive(:count).and_return(count)
      subject.calculate_properties
    end

    context 'when there are no System Image Types available' do
      let(:count) { 0 }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       'No System Image Types available, Customization Template cannot be added'
    end

    context 'when there are System Image Types available' do
      let(:count) { 1 }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
  end
end
