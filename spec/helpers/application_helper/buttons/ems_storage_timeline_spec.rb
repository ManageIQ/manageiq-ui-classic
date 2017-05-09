require 'shared/helpers/application_helper/buttons/timeline'

describe ApplicationHelper::Button::EmsStorageTimeline do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:feature => :timeline}} }
  let(:record) { FactoryGirl.create(:ext_management_system) }

  describe '#calculate_properties' do
    include_context 'ApplicationHelper::Button::Timeline#calculate_properties', :entity => 'Storage Manager'
  end
end
