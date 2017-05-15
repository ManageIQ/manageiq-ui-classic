require 'shared/helpers/application_helper/buttons/perf'

describe ApplicationHelper::Button::StoragePerf do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:storage) }

  describe '#calculate_properties' do
    include_context 'ApplicationHelper::Button::Perf#calculate_properties', :entity => 'Datastore'
  end
end
