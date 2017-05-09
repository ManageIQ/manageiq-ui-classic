require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::IsoDatastoreNew do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  before(:all) { clean_up }

  def clean_up
    ManageIQ::Providers::Redhat::InfraManager.delete_all
  end

  describe '#calculate_properties' do
    before(:each) do
      setup
      subject.calculate_properties
    end
    after(:each) { clean_up }

    context 'when there is a RedHat InfraManager without iso datastores' do
      let(:setup) { FactoryGirl.create(:ems_redhat) }
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
    context 'when all RedHat InfraManagers have iso datastores' do
      let(:setup) do
        ems = FactoryGirl.create(:ems_redhat)
        FactoryGirl.create(:iso_datastore, :ems_id => ems.id)
      end
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'No Providers are available to create an ISO Datastore on'
    end
  end
end
