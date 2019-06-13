describe ApplicationHelper::Button::ZoneDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:zone_name) { 'NotDefault' }
  let(:selected_zone) { FactoryBot.create(:zone, :name => zone_name) }
  let(:button) { described_class.new(view_context, {}, {'selected_zone' => selected_zone}, {}) }

  describe '#calculate_properties' do
    let(:set_relationships) {}
    before do
      set_relationships
      button.calculate_properties
    end

    context 'when selected zone is the default one' do
      let(:zone_name) { 'Default' }
      it_behaves_like 'a disabled button', "'Default' zone cannot be deleted"
    end

    context 'when selected zone is not the default one' do
      context 'and zone has ext_management_systems' do
        let(:set_relationships) { selected_zone.ext_management_systems << FactoryBot.create(:ems_vmware) }
        it_behaves_like 'a disabled button', 'Cannot delete a Zone that has Relationships'
      end

      context 'and zone has miq_schedules' do
        let(:set_relationships) do
          EvmSpecHelper.local_guid_miq_server_zone
          selected_zone.miq_schedules << FactoryBot.create(:miq_schedule)
        end
        it_behaves_like 'a disabled button', 'Cannot delete a Zone that has Relationships'
      end

      context 'and zone has miq_servers' do
        let(:set_relationships) { selected_zone.miq_servers << FactoryBot.create(:miq_server) }
        it_behaves_like 'a disabled button', 'Cannot delete a Zone that has Relationships'
      end

      context 'and zone has no relationships' do
        it_behaves_like 'an enabled button'
      end
    end
  end
end
