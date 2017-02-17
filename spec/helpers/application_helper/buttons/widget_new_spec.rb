describe ApplicationHelper::Button::WidgetNew do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:lastaction) { '' }
  let(:display) { '' }
  let(:x_node) { 'not_root' }
  subject { described_class.new(view_context, {}, {'lastaction' => lastaction, 'display' => display}, {}) }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  it_behaves_like 'a _new or _discover button'

  describe '#visible?' do
    context 'when x_node == root' do
      let(:x_node) { 'root' }
      it { expect(subject.visible?).to be_falsey }
    end
    context 'when x_node != root' do
      it { expect(subject.visible?).to be_truthy }
    end
  end
end
