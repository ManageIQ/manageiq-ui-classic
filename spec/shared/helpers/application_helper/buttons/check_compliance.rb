require 'shared/helpers/application_helper/buttons/basic'

shared_context 'ApplicationHelper::Button::CheckCompliance#calculate_properties' do |option|
  let(:stub_compliance_policies) { allow(record).to receive(:has_compliance_policies?).and_return(has_policies?) }

  context 'when record has compliance policies' do
    let(:has_policies?) { true }
    include_examples 'ApplicationHelper::Button::Basic enabled'
  end
  context 'when record does not have compliance policies' do
    let(:has_policies?) { false }
    include_examples 'ApplicationHelper::Button::Basic disabled',
                     :error_message => "No Compliance Policies assigned to this #{option[:entity]}"
  end
end
