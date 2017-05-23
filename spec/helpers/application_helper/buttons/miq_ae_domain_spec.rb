require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeDomain do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }

  describe '#disabled?' do
    context 'when record has editable properties' do
      let(:record) { FactoryGirl.build(:miq_ae_domain_enabled) }
      it { expect(subject.disabled?).to be_falsey }
    end
    context 'when record has not editable properties' do
      let(:record) { FactoryGirl.build(:miq_ae_system_domain) }
      it { expect(subject.disabled?).to be_truthy }
    end
  end
end
