require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ZoneDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'selected_zone' => selected_zone} }
  let(:props) { Hash.new }
  let(:selected_zone) { FactoryGirl.create(:zone, :name => zone_name) }
  let(:zone_name) { 'NotDefault' }

  describe '#calculate_properties' do
    let(:set_relationships) {}
    before do
      set_relationships
      subject.calculate_properties
    end

    context 'when selected zone is the default one' do
      let(:zone_name) { 'Default' }
      it_behaves_like 'a disabled button', "'Default' zone cannot be deleted"
    end

    context 'when selected zone is not the default one' do
      context 'and zone has ext_management_systems' do
        let(:set_relationships) { selected_zone.ext_management_systems << FactoryGirl.create(:ext_management_system) }
        it_behaves_like 'a disabled button', 'Cannot delete a Zone that has Relationships'
      end

      context 'and zone has miq_schedules' do
        let(:set_relationships) do
          MiqServer.seed
          selected_zone.miq_schedules << FactoryGirl.create(:miq_schedule)
        end
        it_behaves_like 'a disabled button', 'Cannot delete a Zone that has Relationships'
      end

      context 'and zone has miq_servers' do
        let(:set_relationships) { selected_zone.miq_servers << FactoryGirl.create(:miq_server) }
        it_behaves_like 'a disabled button', 'Cannot delete a Zone that has Relationships'
      end

      context 'and zone has no relationships' do
        it_behaves_like 'an enabled button'
      end
    end
  end
end
