require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeDomainUnlock do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }

  describe '#visible?' do
    context 'when domain not locked by user' do
      let(:record) { FactoryGirl.create(:miq_ae_domain) }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'when domain locked by user' do
      let(:record) { FactoryGirl.create(:miq_ae_domain_user_locked) }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end

  describe '#disabled?' do
    context 'when record is a system domain' do
      let(:record) { FactoryGirl.create(:miq_ae_system_domain) }
      it { expect(subject.disabled?).to be_truthy }
    end
    context 'when record is a user locked domain' do
      let(:record) { FactoryGirl.create(:miq_ae_domain_user_locked) }
      it { expect(subject.disabled?).to be_falsey }
    end
  end
end
