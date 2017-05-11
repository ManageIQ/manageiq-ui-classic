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
end
