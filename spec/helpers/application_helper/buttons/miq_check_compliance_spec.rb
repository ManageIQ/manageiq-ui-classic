require 'shared/helpers/application_helper/buttons/check_compliance'

describe ApplicationHelper::Button::MiqCheckCompliance do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:template_redhat) }

  describe '#calculate_properties' do
    before do
      stub_compliance_policies
      subject.calculate_properties
    end

    include_context 'ApplicationHelper::Button::CheckCompliance#calculate_properties', :entity => 'Template'
  end
end
