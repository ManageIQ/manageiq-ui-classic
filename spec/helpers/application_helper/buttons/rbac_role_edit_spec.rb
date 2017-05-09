require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::RbacRoleEdit do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:miq_user_role, :read_only => read_only) }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when role is writable' do
      let(:read_only) { false }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
    context 'when role is read-only' do
      let(:read_only) { true }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'This Role is Read Only and can not be edited'
    end
  end
end
