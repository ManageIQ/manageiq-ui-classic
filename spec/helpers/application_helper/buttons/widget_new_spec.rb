require 'shared/helpers/application_helper/buttons/new'

describe ApplicationHelper::Button::WidgetNew do
  include_context 'ApplicationHelper::Button::New'
  let(:x_node) { 'not_root' }

  describe '#visible?' do
    include_context 'ApplicationHelper::Button::New#visible?'

    context 'when x_node is root' do
      let(:x_node) { 'root' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'when x_node is not root' do
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end
