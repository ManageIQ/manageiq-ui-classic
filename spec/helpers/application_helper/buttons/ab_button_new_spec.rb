require 'shared/helpers/application_helper/buttons/new'

describe ApplicationHelper::Button::AbButtonNew do
  include_context 'ApplicationHelper::Button::New'
  let(:sandbox) { {:active_tree => tree} }
  let(:tree) { :not_ab_tree }
  let(:x_node) { 'xx-ab_12345' }

  describe '#visible?' do
    include_context 'ApplicationHelper::Button::New#visible?'

    context 'when x_active_tree is not :ab_tree' do
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'when x_active_tree is :ab_tree' do
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
