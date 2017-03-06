describe ApplicationHelper::Button::StorageScan do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:hosts) { [] }
  let(:record) { FactoryGirl.create(:storage, :hosts => hosts) }
  let(:feature) { :smartstate_analysis }
  let(:props) { {:options => {:feature => feature}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }

  describe '#calculate_properties' do
    let(:authenticated_hosts) { hosts }
    before do
      allow(record).to receive(:supports?).and_return(feature_supported?)
      allow(record).to receive(:active_hosts_with_authentication_status_ok).and_return(authenticated_hosts)
      button.calculate_properties
    end

    context 'when feature is supported' do
      let(:feature_supported?) { true }
      let(:hosts) { [host] }
      context 'and there are active hosts' do
        let(:host) { FactoryGirl.create(:host, :state => 'on') }
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
