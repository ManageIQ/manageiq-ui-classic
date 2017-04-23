require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::ScheduleRunNow do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tree => tree} }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }

  describe '#visible?' do
    context 'when active_tree != settings_tree' do
      let(:tree) { :not_settings_tree }
      include_examples 'ApplicationHelper::Button::Basic#visible?', false
    end
    context 'when active_tree == settings_tree' do
      let(:tree) { :settings_tree }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end
