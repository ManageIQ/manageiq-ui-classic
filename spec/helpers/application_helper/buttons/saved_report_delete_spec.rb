require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::SavedReportDelete do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tree => tree, :active_tab => tab} }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }
  let(:tab) { nil }

  describe '#visible?' do
    context 'when active_tree is reports_tree' do
      let(:tree) { :reports_tree }
      context 'and active_tab is saved_reports' do
        let(:tab) { 'saved_reports' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and active_tab is not saved_reports' do
        let(:tab) { 'not_saved_reports' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
    context 'when active_tree is not reports_tree' do
      let(:tree) { :savedreports_tree }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end
