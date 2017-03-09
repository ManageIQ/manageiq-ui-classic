describe ApplicationHelper::Button::VmSnapshotAdd do
  let(:controller) { 'vm_infra' }
  let(:session) { {} }
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:zone) { EvmSpecHelper.local_miq_server(:is_master => true).zone }
  let(:ems) { FactoryGirl.create(:ems_vmware, :zone => zone, :name => 'Test EMS') }
  let(:host) { FactoryGirl.create(:host) }
  let(:record) { FactoryGirl.create(:vm_vmware, :ems_id => ems.id, :host_id => host.id) }
  let(:active) { true }
  let(:button) { described_class.new(view_context, {}, {'record' => record, 'active' => active}, {}) }

  describe '#calculate_properties' do
    before :each do
      stub_user(:features => :all)
      button.calculate_properties
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
        it_behaves_like 'a disabled button', 'The VM is not connected to a Host'
      end
      context 'and the selected snapshot is active and current' do
        context 'and current' do
          it_behaves_like 'an enabled button'
        end
      end
    end
    context 'when creating snapshots is not available' do
      let(:record) { FactoryGirl.create(:vm_amazon) }
      it_behaves_like 'a disabled button', 'Operation not supported'
    end
    context 'when user has permissions to create snapsnots' do
      it_behaves_like 'an enabled button'
    end
  end
  describe 'user lacks permissions to create snapshots' do
    before do
      stub_user(:features => :none)
      button.calculate_properties
    end
    context 'when user lacks permissions to create snapsnots' do
      it_behaves_like 'a disabled button', 'Current user lacks permissions to create a new snapshot for this VM'
    end
  end
end
