require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::VmSnapshotRevert do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'record' => record, 'active' => active} }
  let(:props) { Hash.new }
  let(:record) do
    record = FactoryGirl.create(:vm_vmware, :ems_id => ems.id, :host_id => host.id)
    record.snapshots = [FactoryGirl.create(:snapshot,
                                           :create_time       => 1.minute.ago,
                                           :vm_or_template_id => record.id,
                                           :name              => 'EvmSnapshot',
                                           :description       => "Some Description",
                                           :current           => 1)]
    record
  end
  let(:active) { true }
  let(:ems) { FactoryGirl.create(:ems_vmware, :zone => zone, :name => 'Test EMS') }
  let(:host) { FactoryGirl.create(:host) }
  let(:zone) { EvmSpecHelper.local_miq_server(:is_master => true).zone }

  describe '#visible?' do
    context 'when record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Vm)' do
      let(:record) { FactoryGirl.create(:vm_openstack) }
      it { expect(subject.visible?).to be_falsey }
    end
    context 'when !record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Vm)' do
      it { expect(subject.visible?).to be_truthy }
    end
  end

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when reverting to a snapshot is available' do
      it_behaves_like 'an enabled button'
    end
    context 'when reverting to a snapshot is not available' do
      let(:record) { FactoryGirl.create(:vm_amazon) }
      it_behaves_like 'a disabled button', 'Operation not supported'
    end
  end
end
