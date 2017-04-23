require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::HostRegisterNodes do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:ems_openstack_infra) }

  describe '#visible?' do
    context 'when record.class == ManageIQ::Providers::Openstack::InfraManager' do
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
    context 'when recor.class != ManageIQ::Providers::Openstack::InfraManager' do
      let(:record) { FactoryGirl.create(:host_openstack_infra) }
    end
  end
end
