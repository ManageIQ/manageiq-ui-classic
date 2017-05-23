require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::StorageDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record} }
  let(:props) { Hash.new }
  let(:vms) { [] }
  let(:hosts) { [] }
  let(:record) { FactoryGirl.create(:storage, :vms_and_templates => vms, :hosts => hosts) }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when with VMs' do
      let(:vms) { [FactoryGirl.create(:vm_or_template)] }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'Only Datastore without VMs and Hosts can be removed'
    end
    context 'when with Hosts' do
      let(:hosts) { [FactoryGirl.create(:host)] }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'Only Datastore without VMs and Hosts can be removed'
    end
    context 'when without VMs and Hosts' do
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
  end
end
