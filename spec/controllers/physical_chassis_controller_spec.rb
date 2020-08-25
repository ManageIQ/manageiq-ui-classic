require './app/controllers/physical_chassis_controller'

describe PhysicalChassisController do
  render_views

  let(:physical_chassis) do
    ems = FactoryBot.create(:ems_redfish_physical_infra)
    asset_detail = FactoryBot.create(:asset_detail)
    FactoryBot.create(:physical_chassis, :ems_id => ems.id, :asset_detail => asset_detail)
  end

  before do
    stub_user(:features => :all)
    EvmSpecHelper.local_miq_server
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryBot.create(:user)
  end

  describe "#show_list" do
    subject { get(:show_list) }

    describe '#GTL' do
      it "renders a GTL page" do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/_gtl")
      end

      it 'renders GTL with PhysicalChassis model' do
        physical_chassis
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(:model_name      => physical_chassis.class.to_s)
        post :show_list
        expect(response.status).to eq(200)
      end
    end

    describe '#report_data' do
      it 'calls "page_display_options" and returns the MiqRequest data' do
        physical_chassis
        report_data_request(:model => physical_chassis.class.to_s)
        results = assert_report_data_response
        expect(results['data']['rows'].length).to eq(1)
      end
    end
  end

  describe "#show" do
    context "with valid id" do
      subject { get(:show, :params => {:id => physical_chassis.id}) }

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
