require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::MiqAeInstanceCopy do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:child_id => child_id} }
  let(:record) { FactoryGirl.create(:miq_ae_class, :of_domain, :domain => domain) }
  let(:domain) { FactoryGirl.create(:miq_ae_domain_disabled) }
  let(:session) { Hash.new }

  before { login_as FactoryGirl.create(:user, :with_miq_edit_features) }

  describe '#visible?' do
    context 'when domain is locked' do
      context 'and button is miq_ae_instance_copy' do
        let(:child_id) { 'miq_ae_instance_copy' }
        context 'with record as domain' do
          let(:record) { domain }
          include_examples 'ApplicationHelper::Button::Basic#visible?', true
        end
        context 'with record as class of locked domain' do
          include_examples 'ApplicationHelper::Button::Basic#visible?', true
        end
      end
      context 'and button is miq_ae_method_copy with method record' do
        let(:child_id) { 'miq_ae_method_copy' }
        let(:klass) { FactoryGirl.create(:miq_ae_class, :of_domain, :domain => domain) }
        let(:record) do
          FactoryGirl.create(:miq_ae_method, :scope => 'class', :language => 'ruby',
                                          :location => 'builtin', :ae_class => klass)
        end
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
    end
  end

  describe '#disabled?' do
    context 'when record is a class of a locked domain' do
      context 'and button is miq_ae_instance_copy with an editable record' do
        let(:child_id) { 'miq_ae_instance_copy' }
        before { allow(record).to receive(:editable?).and_return(false) }
        it { expect(subject.disabled?).to be_truthy }
      end
      context 'and button is miq_ae_method_copy' do
        let(:child_id) { 'miq_ae_method_copy' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
    end
  end
end
