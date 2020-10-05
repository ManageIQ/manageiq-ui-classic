describe ContainerTemplateController do
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
    container_template = ContainerTemplate.create(:ext_management_system => ems, :name => "Test Template")
    get :show, :params => { :id => container_template.id }
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
    expect(response).to render_template('layouts/_textual_groups_generic')
    expect(assigns(:breadcrumbs)).to eq([{:name => "Container Templates",
                                          :url  => "/container_template/show_list?page=&refresh=y"},
                                         {:name => "Test Template (Summary)",
                                          :url  => "/container_template/show/#{container_template.id}"}])
  end

  it "renders show_list" do
    session[:settings] = {:default_search => 'foo',
                          :views          => {:containertemplate => 'list'},
                          :perpage        => {:list => 10}}

    EvmSpecHelper.create_guid_miq_server_zone

    get :show_list
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end

  it "renders grid view" do
    EvmSpecHelper.create_guid_miq_server_zone
    ems = FactoryBot.create(:ems_openshift)
    container_template = ContainerTemplate.create(:ext_management_system => ems, :name => "Test Template")

    session[:settings] = {
      :views => {:containertemplate => "grid"}
    }

    post :show_list, :params => {:controller => 'container_template', :id => container_template.id}
    expect(response).to render_template('layouts/react/_gtl')
    expect(response.status).to eq(200)
  end
end
