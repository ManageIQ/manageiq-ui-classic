require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::RbacUserDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when user is the root administrator' do
      let(:record) { FactoryGirl.create(:user_admin, :userid => 'admin') }
      it_behaves_like 'a disabled button', 'Default Administrator can not be deleted'
    end
    context 'when user is a common administrator' do
      let(:record) { FactoryGirl.create(:user) }
      it_behaves_like 'an enabled button'
    end
  end
end
