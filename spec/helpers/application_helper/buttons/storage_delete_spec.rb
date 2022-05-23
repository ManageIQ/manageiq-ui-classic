describe ApplicationHelper::Button::StorageDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:vms) { [] }
  let(:hosts) { [] }
  let(:record) { FactoryBot.create(:storage, :vms_and_templates => vms, :hosts => hosts) }
  let(:button) { described_class.new(view_context, {}, {'record' => record}, {}) }

  describe '#disabled?' do
    context 'when with VMs' do
      let(:vms) { [FactoryBot.create(:vm_or_template)] }
      it_behaves_like 'a disabled button', 'Only Datastore without VMs and Hosts can be removed'
    end
    context 'when with Hosts' do
      let(:hosts) { [FactoryBot.create(:host)] }
      it_behaves_like 'a disabled button', 'Only Datastore without VMs and Hosts can be removed'
    end
    context 'when without VMs and Hosts' do
      it_behaves_like 'an enabled button'
    end
  end
end
