describe PhysicalServerController do
  include CompressedIds

  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.build(:zone) }

  describe "#show" do
    render_views
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      ems = FactoryGirl.create(:ems_physical_infra)
      computer_system = FactoryGirl.create(:computer_system, :hardware => FactoryGirl.create(:hardware))
      physical_server = FactoryGirl.create(:physical_server, :computer_system => computer_system, :ems_id => ems.id)
      get :show, :params => {:id => physical_server.id}
    end
    it {
      pending("temporarily skipping")
      expect(response.status).to eq(200)
    }
  end

  describe "#show_list" do
    before(:each) do
      stub_user(:features => :all)
      FactoryGirl.create(:physical_server)
      get :show_list
    end
    it { expect(response.status).to eq(200) }
  end

  describe "#button" do
    before(:each) do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      ems = FactoryGirl.create(:ems_physical_infra)
      computer_system = FactoryGirl.create(:computer_system, :hardware => FactoryGirl.create(:hardware))
      FactoryGirl.create(:physical_server, :computer_system => computer_system, :ems_id => ems.id)
      ApplicationController.handle_exceptions = true
    end

    it "when Power On is pressed" do
      expect(controller).to receive(:physical_server_power_on)
      post :button, :params => { :pressed => 'physical_server_power_on', :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Power Off is pressed" do
      expect(controller).to receive(:physical_server_power_off)
      post :button, :params => { :pressed => 'physical_server_power_off', :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Restart is pressed" do
      expect(controller).to receive(:physical_server_restart)
      post :button, :params => { :pressed => 'physical_server_restart', :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Blink Led is pressed" do
      expect(controller).to receive(:physical_server_blink_loc_led)
      post :button, :params => { :pressed => 'physical_server_blink_loc_led', :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Turn On Led is pressed" do
      expect(controller).to receive(:physical_server_turn_on_loc_led)
      post :button, :params => { :pressed => 'physical_server_turn_on_loc_led', :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Turn Off Led is pressed" do
      expect(controller).to receive(:physical_server_turn_off_loc_led)
      post :button, :params => { :pressed => 'physical_server_turn_off_loc_led', :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end
  end
end
