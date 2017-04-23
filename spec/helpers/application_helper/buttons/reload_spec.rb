require 'shared/helpers/application_helper/buttons/basic'

describe ApplicationHelper::Button::Reload do
  include_context 'ApplicationHelper::Button::Basic'
  let(:sandbox) { {:active_tree => tree, :active_tab => tab} }
  let(:instance_data) { Hash.new }
  let(:props) { Hash.new }
  let(:tree) { nil }
  let(:tab) { nil }
  let(:x_node) { nil }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  describe '#visible?' do
    context 'when active_tree == reports_tree' do
      let(:tree) { :reports_tree }
      context 'and active_tab == saved_reports' do
        let(:tab) { 'saved_reports' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and active_tab != saved_reports' do
        let(:tab) { 'not_saved_reports' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
    context 'when active_tree == savedreports_tree' do
      let(:tree) { :savedreports_tree }
      context 'and x_node == root' do
        let(:x_node) { 'root' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', true
      end
      context 'and x_node != root' do
        let(:x_node) { 'not_root' }
        include_examples 'ApplicationHelper::Button::Basic#visible?', false
      end
    end
    context 'when active_tree != reports_tree && active_tree != savedreports_tree' do
      let(:tree) { :not_any_of_reports_trees }
      include_examples 'ApplicationHelper::Button::Basic#visible?', true
    end
  end
end
