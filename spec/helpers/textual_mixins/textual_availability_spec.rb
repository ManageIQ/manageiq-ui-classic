describe TextualMixins::TextualAvailability do
  describe '#translated_status' do
    subject { helper.translated_status(status) }

    before do
      stub_const("TextualMixins::TextualAvailability::STATUS_TRANSLATIONS",
                 'running' => N_('Translation'))
    end

    context 'when status is in the translation key' do
      let(:status) { 'Running' }

      it { is_expected.to eq 'Translation' }
    end

    context 'when status is not in the translation key' do
      let(:status) { 'Untranslated' }

      it { is_expected.to eq 'Untranslated' }
    end
  end
end
