require 'shared/helpers/application_helper/buttons/generic_feature_button_with_disabled'

describe ApplicationHelper::Button::StorageScan do
  include_context 'ApplicationHelper::Button::GenericFeatureButton'
  let(:record) { FactoryGirl.create(:storage, :hosts => hosts) }
  let(:hosts) { [host] }
  let(:host) { FactoryGirl.create(:host, :state => 'on') }
  let(:feature) { :smartstate_analysis }
  let(:authenticated_hosts) { hosts }

  before { allow(record).to receive(:active_hosts_with_authentication_status_ok).and_return(authenticated_hosts) }

  describe '#calculate_properties' do
    context 'when feature is not supported' do
      include_context 'ApplicationHelper::Button::GenericFeatureButtonWithDisabled#calculate_properties'
    end

    context 'when feature is supported' do
      before do
        allow(record).to receive(:supports?).and_return(true)
        subject.calculate_properties
      end

      context 'and there are active hosts' do
        context 'but none has valid credentials for the Datastore' do
          let(:authenticated_hosts) { [] }
          include_examples 'ApplicationHelper::Button::Basic disabled',
                           :error_message => 'There are no running Hosts with valid credentials for this Datastore'
        end
        context 'with valid credentials for this Datastore' do
          include_examples 'ApplicationHelper::Button::Basic enabled'
        end
      end
      context 'and there are no active hosts' do
        let(:host) { FactoryGirl.create(:host, :state => 'off') }
        include_examples 'ApplicationHelper::Button::Basic disabled',
                         :error_message => 'SmartState Analysis cannot be performed when there is no active Host'
      end
    end
  end
end
