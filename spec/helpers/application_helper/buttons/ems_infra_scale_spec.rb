require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::EmsInfraScale do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:ems_openstack_infra) }

  describe '#visible?' do
    context 'when record is OpenStack Provider' do
      context 'and orchestration stack is empty' do
        include_examples 'ApplicationHelper::Button::Basic hidden'
      end
      context 'and orchestration stack is not empty' do
        let(:record) { FactoryGirl.create(:ems_openstack_infra_with_stack) }
        include_examples 'ApplicationHelper::Button::Basic visible'
      end
    end
    context 'when record is not an OpenStack provider' do
      let(:record) { :ems_redhat }
      include_examples 'ApplicationHelper::Button::Basic hidden'
    end
  end
end
