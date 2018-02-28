describe PhysicalServerController do
  render_views

  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.build(:zone) }

  before(:each) do
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user)
    ems = FactoryGirl.create(:ems_physical_infra)
    asset_detail = FactoryGirl.create(:asset_detail)
    computer_system = FactoryGirl.create(:computer_system, :hardware => FactoryGirl.create(:hardware))
    @physical_server = FactoryGirl.create(:physical_server,
                                          :asset_detail    => asset_detail,
                                          :computer_system => computer_system,
                                          :ems_id          => ems.id,
                                          :id              => 1)
  end

  describe "#show_list" do
    before(:each) do
      FactoryGirl.create(:physical_server)
    end

    subject { get :show_list }

    it do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/_gtl")
    end
  end

  describe "#show" do
    context "with valid id" do
      subject { get :show, :params => {:id => @physical_server.id} }

      it "should respond to show" do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
      end
    end

    context "with invalid id" do
      subject { get :show, :params => {:id => 2 } }

      it "should redirect to #show_list" do
        is_expected.to have_http_status 302
        is_expected.to redirect_to(:action => :show_list)

        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to include("Can't access selected records")
      end
    end

    context "display=timeline" do
      it do
        post :show, :params => {:id => @physical_server.id, :display => "timeline"}
        expect(response.status).to eq 200
        is_expected.to render_template(:partial => "layouts/_tl_show_async")
        expect(controller.send(:flash_errors?)).to be_falsey
      end
    end

    context "display=guest_devices" do
      it do
        post :show, :params => {:id => @physical_server.id, :display => "guest_devices"}
        expect(response.status).to eq 200
        is_expected.to render_template(:partial => "layouts/_gtl")
        expect(controller.send(:flash_errors?)).to be_falsey
      end
    end
  end

  describe "#button" do
    subject { post :button, :params => { :id => @physical_server.id, :pressed => "physical_server_timeline", :format => :js } }

    it "when timelines button is pressed" do
      is_expected.to have_http_status 200
      expect(response.body).to include(%(window.location.href = "/physical_server/show/#{@physical_server.id}?display=timeline"))
    end
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
