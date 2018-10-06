describe ApplicationHelper::Button::VmSnapshotRevert do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:zone) { EvmSpecHelper.local_miq_server(:is_master => true).zone }
  let(:ems) { FactoryGirl.create(:ems_vmware, :zone => zone, :name => 'Test EMS') }
  let(:host) { FactoryGirl.create(:host) }
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
  let(:button) { described_class.new(view_context, {}, {'record' => record, 'active' => active}, {}) }

  describe '#visible?' do
    subject { button.visible? }
    context 'when record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Vm)' do
      let(:record) { FactoryGirl.create(:vm_openstack) }
      it { is_expected.to be_falsey }
    end
    context 'when !record.kind_of?(ManageIQ::Providers::Openstack::CloudManager::Vm)' do
      it { is_expected.to be_truthy }
    end
  end

  describe '#visible? for telefonica' do
    subject { button.visible? }
    context 'when record.kind_of?(ManageIQ::Providers::Telefonica::CloudManager::Vm)' do
      let(:record) { FactoryGirl.create(:vm_telefonica) }
      it { is_expected.to be_falsey }
    end
    context 'when !record.kind_of?(ManageIQ::Providers::Telefonica::CloudManager::Vm)' do
      it { is_expected.to be_truthy }
    end
  end

  describe '#calculate_properties' do
    before { button.calculate_properties }

    context 'when reverting to a snapshot is available' do
      it_behaves_like 'an enabled button'
    end
    context 'when reverting to a snapshot is not available' do
      let(:record) { FactoryGirl.create(:vm_amazon) }
      it_behaves_like 'a disabled button', 'Operation not supported'
    end
  end
end
