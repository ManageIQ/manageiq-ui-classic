require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DialogAddElement do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'edit' => edit} }
  let(:props) { Hash.new }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  context 'when edit' do
    let(:edit) { true }
    context 'and nodes.length < 3' do
      let(:x_node) { 'xx_11' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'and nodes.length is 3' do
      let(:x_node) { 'xx_aa_11' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'and nodes.length is 4' do
      let(:x_node) { 'xx_aa_11_22' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'and nodes.length > 4' do
      let(:x_node) { 'xx_aa_11_22_33' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
  end

  context 'when edit is nil' do
    let(:edit) { nil }
    let(:x_node) { 'does_not_matter' }
    include_examples 'ApplicationHelper::Button::Basic#visible?', false
  end
end
