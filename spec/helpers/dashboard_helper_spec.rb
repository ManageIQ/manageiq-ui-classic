describe DashboardHelper do
  describe '#column_widgets' do
    it "Returns same and uniq widget-ids for col1 and col2" do
      set_data = {:col1 => [1, 2, 3], :col2 => [4, 5]}
      expect(helper.column_widgets(set_data)).to eq([[1, 2, 3], [4, 5]])
    end

    it "Returns uniq widget-ids for col1 and col2" do
      set_data = {:col1 => [1, 2, 3, 1, 2], :col2 => [4, 5, 4, 5]}
      expect(helper.column_widgets(set_data)).to eq([[1, 2, 3], [4, 5]])
    end

    it "Returns blank-array for blank col1 data and same widget-ids for col2 data" do
      set_data = {:col1 => [], :col2 => [4, 5]}
      expect(helper.column_widgets(set_data)).to eq([[], [4, 5]])
    end

    it "Returns blank-array for no col2 data and same widget-ids for col1 data" do
      set_data = {:col1 => [1, 2]}
      expect(helper.column_widgets(set_data)).to eq([[1, 2], []])
    end

    it "Returns blank-array for no col1-data and same widget-ids for col2 data" do
      set_data = {:col2 => [3, 4]}
      expect(helper.column_widgets(set_data)).to eq([[], [3, 4]])
    end

    it "Returns blank-array for no col1 and col2 data" do
      set_data = {}
      expect(helper.column_widgets(set_data)).to eq([[], []])
    end

    it "Returns blank-array for no set_data" do
      set_data = nil
      expect(helper.column_widgets(set_data)).to eq([[], []])
    end
  end
end
