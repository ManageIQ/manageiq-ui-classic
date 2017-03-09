describe ApplicationHelper::Button::DbDelete do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:dashboard) { FactoryGirl.create(:miq_widget_set, :read_only => read_only) }
  let(:button) { described_class.new(view_context, {}, {'db' => dashboard}, {}) }

  describe '#calculate_properties' do
    before { button.calculate_properties }

    context 'when dashboard is read-only' do
      let(:read_only) { true }
      it_behaves_like 'a disabled button', 'Default Dashboard cannot be deleted'
    end
    context 'when dashboard is writable' do
      let(:read_only) { false }
      it_behaves_like 'an enabled button'
    end
  end
end
