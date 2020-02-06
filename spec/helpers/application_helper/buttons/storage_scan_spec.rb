describe ApplicationHelper::Button::StorageScan do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:storage) }
  let(:feature) { :smartstate_analysis }
  let(:props) { {:options => {:feature => feature}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }
  let(:ems) { nil }

  before { allow(record).to receive(:ext_management_system).and_return(ems) }

  it_behaves_like 'a generic feature button after initialization'

  context 'when feature is not supported' do
    it_behaves_like 'GenericFeatureButtonWithDisabled#calculate_properties'
  end

  context 'when feature is supported' do
    describe '#calculate_properties' do
      before do
        button.calculate_properties
      end

      context 'but no EMSs are present' do
        it_behaves_like 'a disabled button', 'Smartstate Analysis cannot be performed on selected Datastore'
      end
      context 'but no EMS has valid credentials for the Datastore' do
        let(:ems) { FactoryBot.create(:ems_vmware) }
        it_behaves_like 'a disabled button', 'There are no EMSs with valid credentials for this Datastore'
      end
      context 'with valid credentials for this Datastore' do
        let(:ems) { FactoryBot.create(:ems_vmware_with_authentication) }
        it_behaves_like 'an enabled button'
      end
    end
  end
end
