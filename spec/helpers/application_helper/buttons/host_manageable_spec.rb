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
    context 'when record.class == ManageIQ::Providers::Openstack::InfraManager::Host' do
      context 'and hardware.provision_state == manageable' do
        let(:provision_state) { String.new 'manageable' }
        it { expect(subject.visible?).to be_falsey }
      end
      context 'and hardware.provision_state != manageable' do
        it { expect(subject.visible?).to be_truthy }
      end
    end
    context 'when record type is not host_openstack_infra, nor ems_openstack_infra' do
      let(:record) { FactoryGirl.create(:host_vmware) }
      it { expect(subject.visible?).to be_falsey }
    end
  end
end
