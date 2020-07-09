describe ContainerBuildController do
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
    ems = FactoryBot.create(:ems_openshift)
    container_build = ContainerBuild.create(:ext_management_system => ems, :name => "Test Build")
    get :show, :params => { :id => container_build.id }
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
    expect(response).to render_template('layouts/_textual_groups_generic')
    expect(assigns(:breadcrumbs)).to eq([{:name => "Container Builds",
                                          :url  => "/container_build/show_list?page=&refresh=y"},
                                         {:name => "Test Build (Summary)",
                                          :url  => "/container_build/show/#{container_build.id}"}])
  end

  it "renders show_list" do
    session[:settings] = {:default_search => 'foo',
                          :views          => {:containerbuild => 'list'},
                          :perpage        => {:list => 10}}

    EvmSpecHelper.create_guid_miq_server_zone

    get :show_list
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end

  it "renders grid view" do
    EvmSpecHelper.create_guid_miq_server_zone
    ems = FactoryBot.create(:ems_openshift)
    container_build = ContainerBuild.create(:ext_management_system => ems, :name => "Test Build")

    session[:settings] = {
      :views => {:containerbuild => "grid"}
    }

    post :show_list, :params => {:controller => 'container_build', :id => container_build.id}
    expect(response).to render_template('layouts/angular/_gtl')
    expect(response.status).to eq(200)
  end
end
