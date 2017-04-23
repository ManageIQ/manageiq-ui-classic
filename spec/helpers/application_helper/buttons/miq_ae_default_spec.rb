require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeDefault do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:session) { Hash.new }
  let(:record) { FactoryGirl.create(:miq_ae_class, :of_domain, :domain => domain) }

  before { login_as FactoryGirl.create(:user, :with_miq_edit_features) }

  describe '#visible?' do
    context 'when button does not copy and domains are not editable' do
      let(:domain) { FactoryGirl.create(:miq_ae_domain_user_locked) }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'when button does not copy but domains are editable' do
      let(:domain) { FactoryGirl.create(:miq_ae_domain) }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'when user has view access only' do
      let(:domain) { FactoryGirl.create(:miq_ae_domain) }
      before { login_as FactoryGirl.create(:user, :features => 'miq_ae_domain_view') }
      it { expect(subject.skipped?).to be_truthy }
    end
  end

  describe '#disabled?' do
    context 'when domains are not editable and not available for copy' do
      let(:domain) { FactoryGirl.create(:miq_ae_domain_user_locked) }
      it { expect(subject.disabled?).to be_falsey }
    end
  end
end
