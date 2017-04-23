require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ConfiguredSystemProvision do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }

  describe '#visible?' do
    context 'when record is present' do
      context 'and record cannot be provisionable' do
        let(:record) { FactoryGirl.create(:configuration_profile_foreman) }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and record is provisionable' do
        let(:record) { FactoryGirl.create(:configured_system_foreman) }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and record is not provisionable' do
        let(:record) { FactoryGirl.create(:configured_system_ansible_tower) }
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
    context 'when record is not present' do
      let(:record) { nil }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end
