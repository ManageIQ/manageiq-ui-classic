require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::StorageScan do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { {:options => {:feature => feature}} }
  let(:record) { FactoryGirl.create(:storage, :hosts => hosts) }
  let(:hosts) { [host] }
  let(:host) { FactoryGirl.create(:host, :state => 'on') }
  let(:feature) { :smartstate_analysis }
  let(:authenticated_hosts) { hosts }

  before { allow(record).to receive(:active_hosts_with_authentication_status_ok).and_return(authenticated_hosts) }

  it_behaves_like 'a generic feature button after initialization'

  context 'when feature is not supported' do
    it_behaves_like 'GenericFeatureButtonWithDisabled#calculate_properties'
  end

  context 'when feature is supported' do
    describe '#calculate_properties' do
      before do
        allow(record).to receive(:supports?).and_return(true)
        subject.calculate_properties
      end

      context 'and there are active hosts' do
        context 'but none has valid credentials for the Datastore' do
          let(:authenticated_hosts) { [] }
          it_behaves_like 'a disabled button', 'There are no running Hosts with valid credentials for this Datastore'
        end
        context 'with valid credentials for this Datastore' do
          it_behaves_like 'an enabled button'
        end
      end
      context 'and there are no active hosts' do
        let(:host) { FactoryGirl.create(:host, :state => 'off') }
        it_behaves_like 'a disabled button', 'SmartState Analysis cannot be performed when there is no active Host'
      end
    end
  end
end
