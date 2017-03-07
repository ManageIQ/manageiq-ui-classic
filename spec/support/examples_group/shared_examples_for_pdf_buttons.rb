shared_examples_for 'a Pdf button' do
  let(:view_context) { setup_view_context_with_sandbox({}) }
  let(:button) { described_class.new(view_context, {}, {}, {}) }

  describe '#visible?' do
    subject { button.visible? }
    before { allow(PdfGenerator).to receive(:available?).and_return(pdf_generator_available) }

    context 'when PDFGenerator is available' do
      let(:pdf_generator_available) { true }
      it { expect(subject).to be_truthy }
    end
    context 'when PDFGenerator is not available' do
      let(:pdf_generator_available) { false }
      it { expect(subject).to be_falsey }
    end
  end
end
