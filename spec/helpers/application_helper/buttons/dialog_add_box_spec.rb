require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DialogAddBox do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'edit' => edit} }
  let(:props) { Hash.new }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  context 'when edit' do
    let(:edit) { true }
    context 'and x_node.length < 2' do
      let(:x_node) { 'xx' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'and x_node.length == 2' do
      let(:x_node) { 'xx_12' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'and x_node.length == 3' do
      let(:x_node) { 'xx_aa_12' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'and x_node.length > 3' do
      let(:x_node) { 'xx_aa_12_34' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
  end

  context 'when edit == nil' do
    let(:edit) { nil }
    let(:x_node) { 'does_not_matter' }
    include_examples 'ApplicationHelper::Button::Basic#visible?', false
  end
end
