describe PhysicalSwitchController do
  render_views

  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.build(:zone) }

  before(:each) do
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user)
    ems = FactoryGirl.create(:ems_physical_infra)
    hardware = FactoryGirl.create(:hardware)
    asset_detail = FactoryGirl.create(:asset_detail)
    @physical_switch = FactoryGirl.create(:physical_switch,
                                          :hardware     => hardware,
                                          :asset_detail => asset_detail,
                                          :ems_id       => ems.id,
                                          :id           => 1)
  end

  describe "#show_list" do
    before(:each) do
      FactoryGirl.create(:physical_switch)
    end

    subject { get :show_list }

    it do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/_gtl")
    end
  end
end
