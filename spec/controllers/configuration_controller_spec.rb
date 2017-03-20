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
    before(:each) do
      controller.instance_variable_set(:@tabform, "ui_2")
    end

    it 'sets the active tab' do
      controller.send(:build_tabs)
      expect(assigns(:active_tab)).to eq("2")
    end

    it 'sets the available tabs' do
      allow(controller).to receive(:role_allows?).and_return(true)
      controller.send(:build_tabs)

      expect(assigns(:tabs)).to eq([
                                     ["1", _("Visual")],
                                     ["2", _("Default Views")],
                                     ["3", _("Default Filters")],
                                     ["4", _("Time Profiles")]
                                   ])
    end
  end

  describe "#button" do
    let(:time_profile) { FactoryGirl.create(:time_profile) }

    before do
      stub_user(:features => :all)
    end

    it 'handles tp_delete' do
      expect(controller).to receive(:handle_tp_delete).and_call_original
      post :button, :params => {
        :pressed => "tp_delete",
        :format => :js,
        "check_#{time_profile.id}".to_sym => 1
      }
      expect(assigns(:flash_array).first[:message]).to match(/Delete successful/)
    end

    it 'handles tp_edit' do
      expect(controller).to receive(:handle_tp_edit).and_call_original
      post :button, :params => {
        :pressed => "tp_edit",
        :format => :js,
        "check_#{time_profile.id}".to_sym => 1
      }
      expect(assigns(:flash_array)).to be_nil
    end

    it 'handles tp_copy' do
      expect(controller).to receive(:handle_tp_copy).and_call_original
      post :button, :params => {
        :pressed => "tp_copy",
        :format => :js,
        "check_#{time_profile.id}".to_sym => 1
      }
      expect(assigns(:flash_array)).to be_nil
    end
  end
end
