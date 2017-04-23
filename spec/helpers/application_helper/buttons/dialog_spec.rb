require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::Dialog do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'edit' => edit} }
  let(:props) { Hash.new }

  context 'when edit == false' do
    let(:edit) { false }
    include_examples 'ApplicationHelper::Button::Basic#visible?', false
  end
  context 'when edit does not evaluate as false' do
    let(:edit) { true }
    include_examples 'ApplicationHelper::Button::Basic#visible?', true
  end
end
