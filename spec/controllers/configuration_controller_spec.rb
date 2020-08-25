describe ConfigurationController do
  [[0, "12AM-1AM"],
   [7, "7AM-8AM"],
   [11, "11AM-12PM"],
   [18, "6PM-7PM"],
   [19, "7PM-8PM"],
   [23, "11PM-12AM"]].each do |io|
    context ".get_hr_str" do
      it "should return interval for #{io[0]} o'clock: #{io[1]}" do
        interval = controller.get_hr_str(io[0])
        expect(interval).to eql(io[1])
      end
    end
  end

  describe "building tabs" do
    before do
      controller.instance_variable_set(:@tabform, "ui_2")
      login_as FactoryBot.create(:user, :features => "everything")
    end

    it 'sets the active tab' do
      controller.send(:build_tabs)
      expect(assigns(:active_tab)).to eq("2")
    end

    it 'sets the available tabs' do
      controller.send(:build_tabs)

      expect(assigns(:tabs)).to eq([
                                     ["1", "Visual"],
                                     ["3", "Default Filters"],
                                     ["4", "Time Profiles"]
                                   ])
    end
  end
end
