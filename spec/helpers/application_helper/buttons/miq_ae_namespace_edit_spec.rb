require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeNamespaceEdit do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:session) { Hash.new }

  before { login_as FactoryGirl.create(:user, :with_miq_edit_features) }

  describe '#visible?' do
    context 'when domain is unlocked' do
      let(:record) { FactoryGirl.create(:miq_ae_domain) }
      include_examples 'ApplicationHelper::Button::Basic visible'
    end
    context 'when record is a namespace with user domain' do
      let(:record) { FactoryGirl.create(:miq_ae_namespace, :parent => FactoryGirl.create(:miq_ae_domain)) }
      include_examples 'ApplicationHelper::Button::Basic visible'
    end
    context 'when record is a namespace with user locked domain' do
      let(:record) { FactoryGirl.create(:miq_ae_namespace, :parent => FactoryGirl.create(:miq_ae_domain_user_locked)) }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
  end

  describe '#disabled?' do
    context 'when record is a system domain' do
      let(:record) { FactoryGirl.create(:miq_ae_system_domain) }
      it { expect(subject.disabled?).to be_truthy }
    end
    context 'when record is a namespace domain of an editable domain' do
      let(:record) { FactoryGirl.create(:miq_ae_namespace, :parent => FactoryGirl.create(:miq_ae_domain)) }
      it { expect(subject.disabled?).to be_falsey }
    end
    context 'when record is a namespace domain of an uneditable domain' do
      let(:record) { FactoryGirl.create(:miq_ae_namespace, :parent => FactoryGirl.create(:miq_ae_system_domain)) }
      it { expect(subject.disabled?).to be_truthy }
    end
  end
end
