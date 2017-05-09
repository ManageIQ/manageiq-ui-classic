require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DialogResourceRemove do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:edit_typ => edit_typ} }
  let(:instance_data) { {'edit' => edit} }
  let(:props) { Hash.new }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  context 'when edit' do
    let(:edit) { true }
    context 'when edit_typ is add' do
      let(:edit_typ) { 'add' }
      let(:x_node) { 'does_not_matter' }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'when edit_typ is not add' do
      let(:edit_typ) { 'not_add' }
      context 'and x_node is root' do
        let(:x_node) { 'root' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
      context 'and x_node is not root' do
        let(:x_node) { 'not_root' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
    end
  end

  context 'when edit is nil' do
    let(:edit) { nil }
    let(:edit_typ) { 'does not matter' }
    let(:x_node) { 'does_not_matter' }
    include_examples 'ApplicationHelper::Button::Basic#visible?', false
  end
end
