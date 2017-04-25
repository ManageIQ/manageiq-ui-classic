require 'shared/helpers/application_helper/buttons/timeline'

describe ApplicationHelper::Button::VmTimeline do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#calculate_properties' do
    include_context 'ApplicationHelper::Button::Timeline#calculate_properties', 'VM'
  end
end
