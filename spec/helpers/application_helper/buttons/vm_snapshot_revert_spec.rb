describe ApplicationHelper::Button::VmSnapshotRevert do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:zone) { EvmSpecHelper.local_miq_server(:is_master => true).zone }
  let(:ems) { FactoryBot.create(:ems_vmware, :zone => zone, :name => 'Test EMS') }
  let(:host) { FactoryBot.create(:host) }
  let(:record) do
    record = FactoryBot.create(:vm_vmware, :ems_id => ems.id, :host_id => host.id)
    record.snapshots = [FactoryBot.create(:snapshot,
                                          :create_time       => 1.minute.ago,
                                          :vm_or_template_id => record.id,
                                          :name              => 'EvmSnapshot',
                                          :description       => "Some Description",
                                          :current           => 1)]
    record
  end
  let(:active) { true }
  let(:button) { described_class.new(view_context, {}, {'record' => record, 'active' => active}, {}) }

  describe '#visible?' do
    subject { button.visible? }
    context 'when record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Vm)' do
      let(:record) { FactoryBot.create(:vm_openstack) }
      it { is_expected.to be_falsey }
    end
    context 'when !record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Vm)' do
      it { is_expected.to be_truthy }
    end
  end

  describe '#disabled?' do
    context 'when reverting to a snapshot is available' do
      it_behaves_like 'an enabled button'
    end
    context 'when reverting to a snapshot is not available' do
      let(:record) { FactoryBot.create(:vm_amazon) }
      it_behaves_like 'a disabled button', 'Feature not available/supported'
    end
  end
end
