require 'shared/helpers/application_helper/buttons/timeline'

describe ApplicationHelper::Button::ContainerTimeline do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:entity => 'Container'}} }
  let(:record) { FactoryGirl.create(:container) }

  describe '#calculate_properties' do
    include_context 'ApplicationHelper::Button::Timeline#calculate_properties', 'Container'
  end
end
