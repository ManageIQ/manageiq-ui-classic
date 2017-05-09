require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DialogResDiscard do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:edit_typ => edit_typ} }
  let(:instance_data) { {'edit' => edit} }
  let(:props) { Hash.new }

  context 'when edit' do
    let(:edit) { true }
    context 'and @sb[:edit_typ] is add' do
      let(:edit_typ) { 'add' }
      include_examples 'ApplicationHelper::Button::Basic visible'
    end
    context 'and @sb[:edit_typ] is not add' do
      let(:edit_typ) { 'not_add' }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
  end

  context 'when edit is nil' do
    let(:edit) { nil }
    let(:edit_typ) { 'does not matter' }
    include_examples 'ApplicationHelper::Button::Basic hidden'
  end
end
