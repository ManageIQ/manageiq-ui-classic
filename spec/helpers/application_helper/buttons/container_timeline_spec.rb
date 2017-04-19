require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ContainerTimeline do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:entity => 'Container'}} }
  let(:record) { FactoryGirl.create(:container) }

  it_behaves_like 'a timeline button', :entity => 'Container'
end
