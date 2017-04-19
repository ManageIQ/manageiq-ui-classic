require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::HostCheckCompliance do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    before { allow(record).to receive(:has_compliance_policies?).and_return(has_compliance_policies) }
    before(:each) { subject.calculate_properties }

    context 'and record has compliance policies' do
      let(:has_compliance_policies) { true }
      it_behaves_like 'an enabled button'
    end

    context 'and record has not compliance policies' do
      let(:has_compliance_policies) { false }
      it_behaves_like 'a disabled button',
                      'No Compliance Policies assigned to this Host'
    end
  end
end
