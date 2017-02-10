describe ContainerImageController do
  let!(:user) { stub_user(:features => :all) }

  describe '#index' do
    render_views

    it "renders index" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
    end
  end

  describe "#button" do
    include_examples :container_button_examples, "container_image"

    it "when Smart Analysis is pressed" do
      expect(controller).to receive(:handle_container_image_scan)
      post :button, :params => { :pressed => "container_image_scan", :format => :js }
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Check Compliance is pressed with no images" do
      expect(controller).to receive(:check_compliance).and_call_original
      expect(controller).to receive(:add_flash).with("Container Image no longer exists", :error)
      expect(controller).to receive(:add_flash).with("No Container Images were selected for Compliance Check", :error)
      post :button, :params => { :pressed => "container_image_check_compliance", :format => :js }
    end
  end

  describe "#show" do
    render_views

    let(:ems) { FactoryGirl.create(:ems_kubernetes) }

    let(:image) do
      FactoryGirl.create(:container_image, :name => "Test Image", :ext_management_system => ems)
    end

    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    subject { get :show, :params => { :id => image.id } }

    it "renders the show screen" do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/listnav/_container_image")
    end

    it "shows the proper breadcrumbs" do
      get :show, :params => { :id => image.id }
      expect(assigns(:breadcrumbs)).to eq([{:name => "Container Images",
                                            :url  => "/container_image/show_list?page=&refresh=y"},
                                           {:name => "Test Image (Summary)",
                                            :url  => "/container_image/show/#{image.id}"}])
    end
  end

  describe '#show_list' do
    render_views

    it "renders show_list" do
      session[:settings] = {:default_search => 'foo',
                            :views          => {:containerimage => 'list'},
                            :perpage        => {:list => 10}}

      EvmSpecHelper.create_guid_miq_server_zone

      get :show_list
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end
  end

  include_examples '#download_summary_pdf', :container_image
end
