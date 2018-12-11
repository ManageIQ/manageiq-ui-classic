describe ContainerServiceController do
  render_views
  before do
    stub_user(:features => :all)
  end

  it "renders index" do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  it "renders show screen" do
    EvmSpecHelper.create_guid_miq_server_zone
    ems = FactoryBot.create(:ems_kubernetes)
    container_service = ContainerService.create(:ext_management_system => ems, :name => "Test Service")
    get :show, :params => { :id => container_service.id }
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
    expect(assigns(:breadcrumbs)).to eq([{:name => "Container Services",
                                          :url  => "/container_service/show_list?page=&refresh=y"},
                                         {:name => "Test Service (Summary)",
                                          :url  => "/container_service/show/#{container_service.id}"}])
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user)
      @service = FactoryBot.create(:container_service)
    end

    subject { get :show, :params => { :id => @service.id } }

    context "render" do
      render_views

      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_container_service")
        is_expected.to render_template('layouts/_textual_groups_generic')
      end
    end
  end

  it "renders show_list" do
    session[:settings] = {:default_search => 'foo',
                          :views          => {:containerservice => 'list'},
                          :perpage        => {:list => 10}}

    EvmSpecHelper.create_guid_miq_server_zone

    get :show_list
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end
end
