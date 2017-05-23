require 'shared/helpers/application_helper/buttons/timeline'

describe ApplicationHelper::Button::MiqTemplateTimeline do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:template_redhat) }

  describe '#calculate_properties' do
    include_context 'ApplicationHelper::Button::Timeline#calculate_properties', :entity => 'Template'
  end
end
