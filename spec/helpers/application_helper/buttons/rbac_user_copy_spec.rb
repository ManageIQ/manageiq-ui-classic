require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::RbacUserCopy do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when user is an administrator' do
      let(:record) { FactoryGirl.create(:user_admin) }
      it_behaves_like 'a disabled button', 'Super Administrator can not be copied'
    end
    context 'when user is not an administrator' do
      let(:record) { FactoryGirl.create(:user) }
      it_behaves_like 'an enabled button'
    end
  end
end
