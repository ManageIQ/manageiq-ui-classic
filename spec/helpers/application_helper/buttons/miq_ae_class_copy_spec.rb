require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeClassCopy do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:miq_ae_class, :of_domain, :domain => domain) }
  let(:session) { Hash.new }

  before { login_as FactoryGirl.create(:user, :with_miq_edit_features) }

  describe '#visible?' do
    context 'when there are no editable domains' do
      let(:domain) { FactoryGirl.create(:miq_ae_domain_user_locked) }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
    context 'when there are editable domains' do
      let(:domain) { FactoryGirl.create(:miq_ae_domain) }
      include_examples 'ApplicationHelper::Button::Basic visible'
    end
  end
end
