require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DbSeqEdit do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'widgetsets' => widgetsets} }
  let(:props) { Hash.new }
  let(:dashboard_count) { 2 }
  let(:widgetsets) { Array.new(dashboard_count) { |_i| FactoryGirl.create(:miq_widget_set) } }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when there is enough dashboards to edit sequence' do
      include_examples 'ApplicationHelper::Button::Basic enabled'
    end
    context 'when there is not enough dashboards to edit sequence' do
      let(:dashboard_count) { 1 }
      include_examples 'ApplicationHelper::Button::Basic disabled',
                       :error_message => 'There should be at least 2 Dashboards to Edit Sequence'
    end
  end
end
