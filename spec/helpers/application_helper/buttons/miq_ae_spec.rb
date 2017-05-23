require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAe do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:child_id => child_id} }
  let(:session) { Hash.new }

  before { login_as FactoryGirl.create(:user, :with_miq_edit_features) }

  describe '#visible?' do
    context 'when button does not copy' do
      let(:child_id) { 'miq_ae_domain_edit' }
      let(:record) { FactoryGirl.build(:miq_ae_domain_enabled) }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
    context do
      let(:child_id) { 'miq_ae_class_copy' }
      context 'when editable domains not available' do
        let(:record) { FactoryGirl.build(:miq_ae_domain_disabled) }
        include_examples 'ApplicationHelper::Button::Basic hidden'
      end
      context 'when editable domains available' do
        let(:record) { FactoryGirl.create(:miq_ae_class, :of_domain, :domain => FactoryGirl.create(:miq_ae_domain)) }
        include_examples 'ApplicationHelper::Button::Basic visible'
      end
    end
  end

  describe '#disabled?' do
    context 'when domains not editable' do
      let(:child_id) { 'miq_ae_domain_edit' }
      let(:record) { FactoryGirl.build(:miq_ae_domain_disabled) }
      it { expect(subject.disabled?).to be_falsey }
    end
    context 'when domains not available for copy but editable' do
      let(:child_id) { 'miq_ae_domain_copy' }
      let(:record) { FactoryGirl.build(:miq_ae_domain_enabled) }
      it { expect(subject.disabled?).to be_falsey }
    end
    context 'when domains are not editable and not available for copy' do
      let(:child_id) { 'miq_ae_domain_edit' }
      let(:record) { FactoryGirl.build(:miq_ae_system_domain) }
      it { expect(subject.disabled?).to be_truthy }
    end
  end
end
