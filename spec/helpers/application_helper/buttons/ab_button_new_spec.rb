require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::AbButtonNew do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tree => tree} }
  let(:instance_data) { {'lastaction' => lastaction, 'display' => display} }
  let(:props) { Hash.new }
  let(:tree) { :not_ab_tree }
  let(:lastaction) { '' }
  let(:display) { '' }
  let(:x_node) { 'xx-ab_12345' }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  it_behaves_like 'a _new or _discover button'

  describe '#visible?' do
    context 'when x_active_tree != :ab_tree' do
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'when x_active_tree == :ab_tree' do
      let(:tree) { :ab_tree }
      context ' and x_node cannot be split into 2 parts' do
        let(:x_node) { 'xx-ab' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and x_node does not start with xx-ab' do
        let(:x_node) { 'ab_11784' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and x_node looks like xx-ab_12345' do
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
  end
end
