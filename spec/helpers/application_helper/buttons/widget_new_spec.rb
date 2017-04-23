require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::WidgetNew do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'lastaction' => lastaction, 'display' => display} }
  let(:props) { Hash.new }
  let(:lastaction) { '' }
  let(:display) { '' }
  let(:x_node) { 'not_root' }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  it_behaves_like 'a _new or _discover button'

  describe '#visible?' do
    context 'when x_node == root' do
      let(:x_node) { 'root' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'when x_node != root' do
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end
