describe ApplicationHelper::Button::IsoDatastoreNew do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {}, {}) }

  before(:all) { clean_up }

  def clean_up
    ManageIQ::Providers::Redhat::InfraManager.delete_all
  end

  describe '#calculate_properties' do
    before(:each) do
      setup
      button.calculate_properties
    end
    after(:each) { clean_up }

    context 'when there is a RedHat InfraManager without iso datastores' do
      let(:setup) { FactoryGirl.create(:ems_redhat) }
      it_behaves_like 'an enabled button'
    end
    context 'when all RedHat InfraManagers have iso datastores' do
      let(:setup) do
        ems = FactoryGirl.create(:ems_redhat)
        FactoryGirl.create(:iso_datastore, :ems_id => ems.id)
      end
      it_behaves_like 'a disabled button', 'No Providers are available to create an ISO Datastore on'
    end
  end
end
