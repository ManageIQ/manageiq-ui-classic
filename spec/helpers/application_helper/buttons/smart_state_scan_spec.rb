require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::SmartStateScan do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  it_behaves_like 'a smart state scan button'
end
