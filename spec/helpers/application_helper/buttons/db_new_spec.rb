require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::DbNew do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { Hash.new }
  let(:instance_data) { {'widgetsets' => widgetsets} }
  let(:props) { Hash.new }
  let(:dashboard_count) { 9 }
  let(:widgetsets) { Array.new(dashboard_count) { |_i| FactoryGirl.create(:miq_widget_set) } }

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    context 'when dashboard group is full' do
      let(:dashboard_count) { 10 }
      it_behaves_like 'a disabled button', 'Only 10 Dashboards are allowed for a group'
    end
    context 'when dashboard group has still room for a new dashboard' do
      it_behaves_like 'an enabled button'
    end
  end
end
