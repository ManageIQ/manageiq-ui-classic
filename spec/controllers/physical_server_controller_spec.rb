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
      asset_details = FactoryGirl.create(:asset_details)
      computer_system = FactoryGirl.create(:computer_system, :hardware => FactoryGirl.create(:hardware))
      physical_server = FactoryGirl.create(:physical_server,
                                           :asset_details   => asset_details,
                                           :computer_system => computer_system,
                                           :ems_id          => ems.id)
      get :show, :params => {:id => physical_server.id}
    end
    it { expect(response.status).to eq(200) }
  end

  describe "#show_list" do
    before(:each) do
      stub_user(:features => :all)
      FactoryGirl.create(:physical_server)
      get :show_list
    end
    it { expect(response.status).to eq(200) }
  end

  context "#button" do
    it "when Physical Server Manage Policies is pressed" do
      controller.instance_variable_set(:@_params, :pressed => "physical_server_protect")
      expect(controller).to receive(:assign_policies).with(PhysicalServer)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Physical Server Tag is pressed" do
      controller.instance_variable_set(:@_params, :pressed => "physical_server_tag")
      expect(controller).to receive(:tag).with(PhysicalServer)
      controller.button
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end
  end
end
