describe ApplicationHelper::Button::CustomizationTemplateNew do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:lastaction) { '' }
  let(:display) { '' }
  let(:x_node) { 'root' }
  let(:instance_data) { {'lastaction' => lastaction, 'display' => display} }
  let(:button) { described_class.new(view_context, {}, instance_data, {}) }

  before { allow(view_context).to receive(:x_node).and_return(x_node) }

  it_behaves_like 'a _new or _discover button'

  describe '#visible?' do
    subject { button.visible? }
    context 'when root node is active' do
      it { expect(subject).to be_truthy }
    end
    context 'when system node is active' do
      let(:x_node) { 'xx-xx-system' }
      it { expect(subject).to be_falsey }
    end
    context 'when other node is active' do
      let(:x_node) { 'xx-xx-10r3' }
      it { expect(subject).to be_truthy }
    end
  end

  describe '#disabled?' do
    context 'when there are no System Image Types available' do
      before { allow(PxeImageType).to receive(:count).and_return(0) }
      it_behaves_like 'a disabled button', 'No System Image Types available, Customization Template cannot be added'
    end

    context 'when there are System Image Types available' do
      before { allow(PxeImageType).to receive(:count).and_return(1) }
      it_behaves_like 'an enabled button'
    end
  end
end
