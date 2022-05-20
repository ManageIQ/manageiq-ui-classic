describe ApplicationHelper::Button::DbNew do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:dashboard_count) { 9 }
  let(:widgetsets) { Array.new(dashboard_count) { |_i| FactoryBot.create(:miq_widget_set) } }
  let(:button) { described_class.new(view_context, {}, {'widgetsets' => widgetsets}, {}) }

  describe '#disabled?' do
    context 'when dashboard group is full' do
      let(:dashboard_count) { 10 }
      it_behaves_like 'a disabled button', 'Only 10 Dashboards are allowed for a group'
    end
    context 'when dashboard group has still room for a new dashboard' do
      it_behaves_like 'an enabled button'
    end
  end
end
