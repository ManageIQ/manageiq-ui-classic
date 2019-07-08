describe PhysicalSwitchController do
  render_views

  let(:physical_switch) do
    ems = FactoryBot.create(:ems_redfish_physical_infra)
    hardware = FactoryBot.create(:hardware)
    asset_detail = FactoryBot.create(:asset_detail)

    FactoryBot.create(
      :physical_switch,
      :hardware     => hardware,
      :asset_detail => asset_detail,
      :ems_id       => ems.id,
    )
  end

  before do
    EvmSpecHelper.local_miq_server
    stub_user(:features => :all)
    login_as FactoryBot.create(:user)
  end

  describe "#show_list" do
    subject { get :show_list }

    context '#GTL' do
      it "renders a GTL page" do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/_gtl")
      end

      it 'renders GTL with PhysicalSwitch model' do
        physical_switch
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name      => physical_switch.class.to_s,
          :gtl_type_string => "list",
        )
        post :show_list
        expect(response.status).to eq(200)
      end
    end

    context '#report_data' do
      it 'calls "page_display_options" and returns the MiqRequest data' do
        physical_switch
        report_data_request(
          :model => physical_switch.class.to_s,
        )
        results = assert_report_data_response
        expect(results['data']['rows'].length).to eq(1)
      end
    end

    context "physical switch toolbar is available" do
      it 'physical switch toolbar is available' do
        expect(ApplicationHelper::Toolbar::PhysicalSwitchesCenter).to receive(:definition).and_call_original
        subject
      end
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

    context "toolbar buttons" do
      subject { get(:show, :params => {:id => physical_switch.id}) }

      it 'physical switch toolbar is available' do
        expect(ApplicationHelper::Toolbar::PhysicalSwitchCenter).to receive(:definition).and_call_original
        subject
      end
    end
  end
end
