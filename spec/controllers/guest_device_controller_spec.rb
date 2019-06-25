describe GuestDeviceController do
  render_views

  let!(:server) { EvmSpecHelper.local_miq_server }

  before do
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
    login_as FactoryBot.create(:user)
    @guest_device = FactoryBot.create(:guest_device)
  end

  describe "#show_list" do
    before do
      FactoryBot.create(:guest_device)
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

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:layout) { 'layout' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:guest_device_lastaction => lastaction)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Guest Devices")
        expect(controller.instance_variable_get(:@layout)).to eq("guest_device")
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@layout, layout)
        controller.send(:set_session_data)

        expect(controller.session[:guest_device_lastaction]).to eq(lastaction)
        expect(controller.session[:layout]).to eq(layout)
      end
    end
  end
end
