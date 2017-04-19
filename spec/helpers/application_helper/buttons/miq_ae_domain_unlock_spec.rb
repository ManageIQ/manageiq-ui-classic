require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeDomainUnlock do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }

  describe '#visible?' do
    context 'when domain not locked by user' do
      let(:record) { FactoryGirl.create(:miq_ae_domain) }
      it { expect(subject.visible?).to be_falsey }
    end
    context 'when domain locked by user' do
      let(:record) { FactoryGirl.create(:miq_ae_domain_user_locked) }
      it { expect(subject.visible?).to be_truthy }
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
