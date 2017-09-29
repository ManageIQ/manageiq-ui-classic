describe StorageHelper::TextualSummary do
  include NumberHelper

  describe '.textual_format_used_space' do
    it 'returns 0 for 0 amount' do
      expect(textual_format_used_space(100, 10, 0)).to eq(0)
    end

    it 'returns formated plural message for number>1' do
      expect(textual_format_used_space(100, 10, 1000)).to eq('100 Bytes (10% of Used Space, 1000 files)')
    end

    it 'returns formated singular message for number=1' do
      expect(textual_format_used_space(100, 10, 1)).to eq('100 Bytes (10% of Used Space, 1 file)')
    end

    it 'rounds number of bytes to 2 decimal points' do
      expect(textual_format_used_space(3331, 10, 1)).to eq('3.25 KB (10% of Used Space, 1 file)')
    end
  end
end
