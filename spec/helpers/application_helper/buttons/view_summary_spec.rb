describe ApplicationHelper::Button::ViewSummary do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {'showtype' => showtype}, {}) }

  describe '#disabled?' do
    context 'when showtype == dashboard' do
      let(:showtype) { 'dashboard' }
      it_behaves_like 'an enabled button'
    end
    context 'when showtype != dashboard' do
      let(:showtype) { 'not_dashboard' }
      it_behaves_like 'a disabled button'
    end
  end
end
