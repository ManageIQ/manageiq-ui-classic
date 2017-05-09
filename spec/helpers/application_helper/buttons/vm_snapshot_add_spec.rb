require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::VmSnapshotAdd do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record, 'active' => active} }
  let(:props) { Hash.new }
  let(:record) { FactoryGirl.create(:vm_vmware, :ems_id => ems.id, :host_id => host.id) }
  let(:active) { true }
  let(:ems) { FactoryGirl.create(:ems_vmware, :zone => zone, :name => 'Test EMS') }
  let(:host) { FactoryGirl.create(:host) }
  let(:zone) { EvmSpecHelper.local_miq_server(:is_master => true).zone }
  let(:controller) { 'vm_infra' }
  let(:session) { {} }

  describe '#calculate_properties' do
    before :each do
      stub_user(:features => :all)
      subject.calculate_properties
    end
    context 'when creating snapshots is available' do
      let(:current) { 1 }
      let(:record) do
        record = FactoryGirl.create(:vm_vmware, :ems_id => ems.id, :host_id => host.id)
        record.snapshots = [FactoryGirl.create(:snapshot,
                                               :create_time       => 1.minute.ago,
                                               :vm_or_template_id => record.id,
                                               :name              => 'EvmSnapshot',
                                               :description       => "Some Description",
                                               :current           => current)]
        record
      end
      context 'and the selected snapshot may be active but the vm is not connected to a host' do
        let(:record) { FactoryGirl.create(:vm_vmware) }
        include_examples 'ApplicationHelper::Button::Basic disabled',
                         :error_message => 'The VM is not connected to a Host'
      end
      context 'and the selected snapshot is active and current' do
        context 'and current' do
          include_examples 'ApplicationHelper::Button::Basic enabled'
        end
      end
    end
    context 'when creating snapshots is not available' do
      let(:record) { FactoryGirl.create(:vm_amazon) }
      include_examples 'ApplicationHelper::Button::Basic disabled', :error_message => 'Operation not supported'
    end
    context 'when user has permissions to create snapsnots' do
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
  end
  describe 'user lacks permissions to create snapshots' do
    before do
      stub_user(:features => :none)
      subject.calculate_properties
    end
    context 'when user lacks permissions to create snapsnots' do
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'Current user lacks permissions to create a new snapshot for this VM'
    end
  end
end
