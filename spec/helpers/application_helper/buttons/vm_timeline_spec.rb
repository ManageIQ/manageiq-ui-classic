require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::VmTimeline do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  it_behaves_like 'a timeline button', :entity => 'VM'
end
