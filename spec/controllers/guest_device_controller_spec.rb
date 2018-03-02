describe GuestDeviceController do
  render_views

  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.build(:zone) }

  before(:each) do
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryGirl.create(:user)
    @guest_device = FactoryGirl.create(:guest_device, :id => 1)
  end

  describe "#show_list" do
    before(:each) do
      FactoryGirl.create(:guest_device)
    end

    subject { get :show_list }

    it do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/_gtl")
    end
  end

  describe "#show" do
    context "with valid id" do
      subject { get :show, :params => {:id => @guest_device.id} }

      it "should respond to show" do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/_textual_groups_generic")
      end
    end

    context "with invalid id" do
      subject { get :show, :params => {:id => (@guest_device.id + 1) } }

      it "should redirect to #show_list" do
        is_expected.to have_http_status 302
        is_expected.to redirect_to(:action => :show_list)

        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to include("Can't access selected records")
      end
    end
  end
end
