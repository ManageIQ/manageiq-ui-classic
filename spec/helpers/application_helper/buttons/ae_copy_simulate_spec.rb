require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::AeCopySimulate do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'resolve' => {:button_class => button_class}} }
  let(:props) { Hash.new }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when object attribute is specified' do
      let(:button_class) { 'some_button_class' }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
    context 'when object attribute is not specified' do
      let(:button_class) { nil }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       'Object attribute must be specified to copy object details for use in a Button'
    end
  end
end
