require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::EmsStorageTimeline do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:feature => :timeline}} }
  let(:record) { FactoryGirl.create(:ext_management_system) }

  it_behaves_like 'a timeline button', :entity => 'Storage Manager'
end
