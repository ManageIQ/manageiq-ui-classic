require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeDomainPriorityEdit do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:miq_ae_domain) }
  let(:session) { Hash.new }

  before { login_as FactoryGirl.create(:user, :with_miq_edit_features) }

  describe '#disabled?' do
    before { allow(User).to receive(:current_tenant).and_return(Tenant.first) }

    context 'when number of visible domains < 2' do
      before { allow(User.current_tenant).to receive(:visible_domains).and_return([record]) }
      it { expect(subject.disabled?).to be_truthy }
    end
    context 'when number of visible domains >= 2' do
      before { allow(User.current_tenant).to receive(:visible_domains).and_return([record, record]) }
      it { expect(subject.disabled?).to be_falsey }
    end
  end
end
