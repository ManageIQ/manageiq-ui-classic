require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::HostManageable do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:provision_state) { String.new 'not_manageable' }
  let(:record) { FactoryGirl.create(:host_openstack_infra) }

  before { allow(record.hardware).to receive(:provision_state).and_return(provision_state) }

  describe '#visible?' do
    context 'when record.class is ManageIQ::Providers::Openstack::InfraManager::Host' do
      context 'and hardware.provision_state is manageable' do
        let(:provision_state) { String.new 'manageable' }
        include_examples 'ApplicationHelper::Button::Basic hidden'
      end
      context 'and hardware.provision_state is not manageable' do
        include_examples 'ApplicationHelper::Button::Basic visible'
      end
    end
    context 'when record type is not host_openstack_infra, nor ems_openstack_infra' do
      let(:record) { FactoryGirl.create(:host_vmware) }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
  end
end
