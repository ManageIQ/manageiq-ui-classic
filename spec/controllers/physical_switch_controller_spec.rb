describe PhysicalSwitchController do
  render_views

  let(:physical_switch) do
    ems = FactoryGirl.create(:ems_physical_infra)
    hardware = FactoryGirl.create(:hardware)
    asset_detail = FactoryGirl.create(:asset_detail)

    FactoryGirl.create(
      :physical_switch,
      :hardware     => hardware,
      :asset_detail => asset_detail,
      :ems_id       => ems.id,
      :id           => 1
    )
  end

  before do
    EvmSpecHelper.local_miq_server(:zone => FactoryGirl.build(:zone))
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user)
  end

  describe "#show_list" do
    before do
      FactoryGirl.create(:physical_switch)
    end

    subject { get :show_list }

    it "renders a GTL page" do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/_gtl")
    end
  end

  describe "#show" do
    context "with valid id" do
      subject { get(:show, :params => {:id => physical_switch.id}) }

      it "should respond to show" do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
      end
    end
    context "with invalid id" do
      subject { get(:show, :params => {:id => 2}) }

      it "should redirect to #show_list" do
        is_expected.to have_http_status 302
        is_expected.to redirect_to(:action => :show_list)

        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to include("Can't access selected records")
      end
    end
  end
end
