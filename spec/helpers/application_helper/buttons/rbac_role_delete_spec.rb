require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::RbacRoleDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:miq_user_role, :read_only => read_only) }
  let(:read_only) { false }

  describe '#calculate_properties' do
    let(:setup_miq_groups) {}
    before do
      setup_miq_groups
      subject.calculate_properties
    end
    after(:each) { tear_down }

    def tear_down
      MiqGroup.delete_all
    end

    context 'when role is writable' do
      context 'when role is not in use by any Group' do
        include_examples 'ApplicationHelper::Button::Basic enabled'
      end
      context 'when role is in use by one or more Groups' do
        let(:setup_miq_groups) { FactoryGirl.create(:miq_group, :miq_user_role => record) }
        include_examples 'ApplicationHelper::Button::Basic disabled',
                         :error_message => 'This Role is in use by one or more Groups and can not be deleted'
      end
    end
    context 'when role is read-only' do
      let(:read_only) { true }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'This Role is Read Only and can not be deleted'
    end
  end
end
