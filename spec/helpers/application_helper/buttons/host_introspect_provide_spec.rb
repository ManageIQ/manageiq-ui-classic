require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::HostIntrospectProvide do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:provision_state) { 'not_manageable' }
  let(:record) { FactoryGirl.create(:host_openstack_infra) }

  before { allow(record).to receive_message_chain(:hardware, :provision_state).and_return(provision_state) }

  describe '#visible?' do
    context 'when record.class == ManageIQ::Providers::Openstack::InfraManager::Host' do
      context 'and hardware.provision_state == manageable' do
        let(:provision_state) { 'manageable' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and hardware.provision_state != manageable' do
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
    context 'when record type is not host_openstack_infra, nor ems_openstack_infra' do
      let(:record) { FactoryGirl.create(:host_vmware) }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
  end
end
