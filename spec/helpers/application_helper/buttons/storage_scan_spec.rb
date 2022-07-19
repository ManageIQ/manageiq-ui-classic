describe ApplicationHelper::Button::StorageScan do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:record) { FactoryBot.create(:storage, :ext_management_system => ems) }
  let(:feature) { :smartstate_analysis }
  let(:props) { {:options => {:feature => feature}} }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, props) }
  let(:ems) { nil }

  it_behaves_like 'a feature button with disabled'

  describe '#disabled?' do
    context 'when no EMSs are present' do
      it_behaves_like 'a disabled button', 'Smartstate Analysis cannot be performed on selected Datastore'
    end

    context 'when no EMS has valid credentials for the Datastore' do
      let(:ems) { FactoryBot.create(:ems_vmware) }
      it_behaves_like 'a disabled button', 'There are no EMSs with valid credentials for this Datastore'
    end

    context 'when EMS has valid credentials' do
      let(:ems) { FactoryBot.create(:ems_vmware_with_authentication) }
      it_behaves_like 'an enabled button'
    end
  end
end
