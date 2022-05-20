describe ApplicationHelper::Button::IsoDatastoreNew do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {}, {}) }

  describe '#disabled?' do
    context 'when there is a RedHat InfraManager without iso datastores' do
      before do
        FactoryBot.create(:ems_redhat)
      end

      it_behaves_like 'an enabled button'
    end

    context 'when all RedHat InfraManagers have iso datastores' do
      before do
        FactoryBot.create(:iso_datastore, :ems_id => FactoryBot.create(:ems_redhat).id)
      end

      it_behaves_like 'a disabled button', 'No Providers are available to create an ISO Datastore on'
    end
  end
end
