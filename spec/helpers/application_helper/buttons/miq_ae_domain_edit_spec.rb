require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeDomainEdit do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:miq_ae_domain_disabled) }

  describe '#visible?' do
    context 'when domain is locked' do
      it { expect(subject.visible?).to be_truthy }
    end
  end
end
