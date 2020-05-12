describe ContainerProjectController do
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
    container_project = ContainerProject.create(:ext_management_system => ems, :name => "Test Project")
    get :show, :params => { :id => container_project.id, :display => 'main' }
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
    expect(assigns(:breadcrumbs)).to eq([{:name => "Container Projects",
                                          :url  => "/container_project/show_list?page=&refresh=y"},
                                         {:name => "Test Project (Summary)",
                                          :url  => "/container_project/show/#{container_project.id}"}])
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user_with_group)
      @project = FactoryBot.create(:container_project)
    end

    subject { get :show, :params => { :id => @project.id, :display => 'main' } }

    context "render" do
      render_views

      it "correct listnav" do
        is_expected.to have_http_status 200
        is_expected.to render_template('layouts/_textual_groups_generic')
      end

      it "correct listnav for timeline page" do
        get :show, :params => { :id => @project.id, :display => 'timeline' }
        is_expected.to have_http_status 200
      end

      it "renders topology view" do
        get :show, :params => { :id => @project.id, :display => 'topology' }
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
        expect(response).to render_template('container_topology/show')
      end

      it "renders dashboard view" do
        get :show, :params => { :id => @project.id, :display => 'dashboard' }
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
        expect(response).to render_template('container_project/_show_dashboard')
      end
    end
  end

  it "renders show_list" do
    session[:settings] = {:default_search => 'foo',
                          :views          => {:containerproject => 'list'},
                          :perpage        => {:list => 10}}

    EvmSpecHelper.create_guid_miq_server_zone

    get :show_list
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end
end
