require 'shared/helpers/application_helper/buttons/basic'

shared_context 'ApplicationHelper::Button::Pdf#visible?' do
  before { allow(PdfGenerator).to receive(:available?).and_return(pdf_generator_available) }

  context 'when PDFGenerator is available' do
    let(:pdf_generator_available) { true }
    it { expect(subject.visible?).to be_truthy }
  end
  context 'when PDFGenerator is not available' do
    let(:pdf_generator_available) { false }
    it { expect(subject.visible?).to be_falsey }
  end
end
