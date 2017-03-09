describe ApplicationHelper::Button::DbSeqEdit do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:dashboard_count) { 2 }
  let(:widgetsets) { Array.new(dashboard_count) { |_i| FactoryGirl.create(:miq_widget_set) } }
  let(:button) { described_class.new(view_context, {}, {'widgetsets' => widgetsets}, {}) }

  describe '#calculate_properties' do
    before { button.calculate_properties }

    context 'when there is enough dashboards to edit sequence' do
      it_behaves_like 'an enabled button'
    end
    context 'when there is not enough dashboards to edit sequence' do
      let(:dashboard_count) { 1 }
      it_behaves_like 'a disabled button', 'There should be at least 2 Dashboards to Edit Sequence'
    end
  end
end
