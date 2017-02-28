describe ApplicationHelper::Button::CustomizationTemplateNew do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:lastaction) { '' }
  let(:display) { '' }
  let(:x_node) { 'root' }
  subject { described_class.new(view_context, {}, {'lastaction' => lastaction, 'display' => display}, {}) }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  it_behaves_like 'a _new or _discover button'

  describe '#visible?' do
    context 'when root node is active' do
      it { expect(subject.visible?).to be_truthy }
    end
    context 'when system node is active' do
      let(:x_node) { 'xx-xx-system' }
      it { expect(subject.visible?).to be_falsey }
    end
    context 'when other node is active' do
      let(:x_node) { 'xx-xx-10r3' }
      it { expect(subject.visible?).to be_truthy }
    end
  end
end
