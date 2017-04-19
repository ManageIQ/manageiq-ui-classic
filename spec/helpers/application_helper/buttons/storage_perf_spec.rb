require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::StoragePerf do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:storage) }

  it_behaves_like 'a performance button', 'Datastore'
end
