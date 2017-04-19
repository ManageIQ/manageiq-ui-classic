require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqRequestDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm) }

  describe '#disabled?' do
    before do
      allow(view_context).to receive(:current_user).and_return(current_user)
      allow(record).to receive(:approval_state).and_return(approval_state)
      allow(record).to receive(:requester_name).and_return(requester_name)
      allow(record).to receive(:resource_type).and_return(resource_type)
    end

    let(:current_user) {  FactoryGirl.create(:user_admin) }
    let(:approval_state) { 'sorryjako' }
    let(:requester_name) { {:requester_name => current_user.name} }
    let(:resource_type) { 'knedlik' }

    before(:each) { subject.calculate_properties }

    context 'requester is admin' do
      let(:requester_name) { {:requester_name => 'FrantaSkocDoPole'} }
      it_behaves_like 'an enabled button'
    end

    context 'request is approved and user is admin' do
      let(:approval_state) { 'approved' }
      it_behaves_like 'an enabled button'
    end

    context 'user is requester and approval state is not approved nor denied' do
      it_behaves_like 'an enabled button'
    end

    context 'request is approved and suer is not admin' do
      let(:approval_state) { 'approved' }
      let(:current_user) { FactoryGirl.create(:user, :role => "test") }
      it_behaves_like 'a disabled button', 'Approved requests cannot be deleted'
    end

    context 'request is approved' do
      let(:current_user) { FactoryGirl.create(:user, :role => "test") }
      it_behaves_like 'a disabled button', 'Users are only allowed to delete their own requests'
    end
  end
end
