describe GtlFormatter do
  describe '.storage_gtl_cell' do
    let(:view) { double('view', :format => '42 GB') }
    let(:row)  { {'id' => 1, 'free_space' => 0, 'v_free_space_percent_of_total' => 0.0, 'uncommitted' => nil} }

    context 'when record does not support :free_space' do
      let(:storage) { FactoryBot.build(:storage, :total_space => 1.gigabyte, :free_space => 0) }

      before do
        stub_supports_not(storage, :free_space)
        stub_supports_not(storage, :uncommitted)
      end

      it 'returns "—" for the free_space column' do
        expect(described_class.storage_gtl_cell(storage, view, row, 'free_space')).to eq('—')
      end

      it 'returns "—" for the v_free_space_percent_of_total column' do
        expect(described_class.storage_gtl_cell(storage, view, row, 'v_free_space_percent_of_total')).to eq('—')
      end

      it 'returns "—" for the uncommitted column' do
        expect(described_class.storage_gtl_cell(storage, view, row, 'uncommitted')).to eq('—')
      end

      it 'returns "—" for the v_used_space_percent_of_total column' do
        expect(described_class.storage_gtl_cell(storage, view, row, 'v_used_space_percent_of_total')).to eq('—')
      end
    end

    context 'when record supports :free_space' do
      let(:storage) { FactoryBot.build(:storage, :total_space => 1.gigabyte, :free_space => 512.megabytes) }

      before do
        stub_supports(storage, :free_space)
        stub_supports(storage, :uncommitted)
        allow(view).to receive(:format).and_return('500 MB')
      end

      it 'delegates to format_col_for_display for free_space' do
        expect(view).to receive(:format).with('free_space', anything, anything).and_return('500 MB')
        expect(described_class.storage_gtl_cell(storage, view, row, 'free_space')).to eq('500 MB')
      end

      it 'delegates to format_col_for_display for v_free_space_percent_of_total' do
        expect(view).to receive(:format).with('v_free_space_percent_of_total', anything, anything).and_return('50.0%')
        expect(described_class.storage_gtl_cell(storage, view, row, 'v_free_space_percent_of_total')).to eq('50.0%')
      end

      it 'delegates to format_col_for_display for name (non-storage-specific column)' do
        expect(view).to receive(:format).with('name', anything, anything).and_return('my-ds')
        expect(described_class.storage_gtl_cell(storage, view, row, 'name')).to eq('my-ds')
      end
    end

    context 'when record supports :free_space but not :uncommitted' do
      let(:storage) { FactoryBot.build(:storage, :total_space => 1.gigabyte, :free_space => 512.megabytes) }

      before do
        stub_supports(storage, :free_space)
        stub_supports_not(storage, :uncommitted)
      end

      it 'returns "—" for the uncommitted column' do
        expect(described_class.storage_gtl_cell(storage, view, row, 'uncommitted')).to eq('—')
      end

      it 'delegates free_space to format_col_for_display' do
        allow(view).to receive(:format).and_return('512 MB')
        expect(described_class.storage_gtl_cell(storage, view, row, 'free_space')).to eq('512 MB')
      end
    end
  end
end
