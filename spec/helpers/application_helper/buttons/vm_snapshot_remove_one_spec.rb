describe ApplicationHelper::Button::VmSnapshotRemoveOne do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:zone) { EvmSpecHelper.local_miq_server(:is_master => true).zone }
  let(:ems) { FactoryBot.create(:ems_redhat, :zone => zone, :name => 'Test EMS') }
  let(:host) { FactoryBot.create(:host) }
  let(:record) do
    record = FactoryBot.create(:vm_redhat, :ems_id => ems.id, :host_id => host.id)
    record.snapshots = [FactoryBot.create(:snapshot,
                                          :create_time       => 1.minute.ago,
                                          :vm_or_template_id => record.id,
                                          :name              => 'EvmSnapshot',
                                          :description       => "Some Description",
                                          :current           => 1)]
    record
  end
  let(:button) { described_class.new(view_context, {}, {'record' => record, 'active' => active}, {}) }
  let(:active) { true }
  before { stub_supports(record.ext_management_system, :snapshots) }
  describe '#disabled?' do
    subject { button.disabled? }
    context 'when record.kind_of?(ManageIQ::Providers::Redhat::InfraManager::Vm)' do
      context 'when record is active' do
        it { is_expected.to be_truthy }
      end
      context 'when record is not active' do
        let(:active) { false }
        it { is_expected.to be_falsey }
      end
    end
    context 'when !record.kind_of?(ManageIQ::Providers::Redhat::InfraManager::Vm)' do
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
      it { is_expected.to be_falsey }
    end
  end
end
