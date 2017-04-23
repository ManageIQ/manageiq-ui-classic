require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAlertDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    before { allow(record).to receive(:owning_miq_actions).and_return(owning_miq_actions) }
    before { allow(record).to receive(:memberof).and_return(memberof) }
    before(:each) { subject.calculate_properties }

    context 'and record doesnt own any action and is not memberof any group' do
      let(:owning_miq_actions) { [] }
      let(:memberof) { [] }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end

    context 'and record is member of group' do
      let(:owning_miq_actions) { [] }
      let(:memberof) { ['group'] }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       'Alerts that belong to Alert Profiles can not be deleted'
    end

    context 'and record owns action' do
      let(:owning_miq_actions) { ['action'] }
      let(:memberof) { [] }
      include_examples 'ApplicationHelper::Button::Basic disabled', 'Alerts referenced by Actions can not be deleted'
    end
  end
end
