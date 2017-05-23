require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqActionDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    before { allow(record).to receive(:miq_policies).and_return(miq_policies) }
    before { allow(record).to receive(:action_type).and_return(action_type) }
    before(:each) { subject.calculate_properties }

    context 'and record has no policies' do
      let(:miq_policies) { [] }
      let(:action_type) { "Non-default" }
      it_behaves_like 'an enabled button'
    end

    context 'and record has assigned policy' do
      let(:miq_policies) { ['policy'] }
      let(:action_type) { "Non-default" }
      it_behaves_like 'a disabled button',
                      'Actions assigned to Policies can not be deleted'
    end

    context 'and record has default action type' do
      let(:miq_policies) { [] }
      let(:action_type) { "default" }
      it_behaves_like 'a disabled button',
                      'Default actions can not be deleted.'
    end
  end
end
