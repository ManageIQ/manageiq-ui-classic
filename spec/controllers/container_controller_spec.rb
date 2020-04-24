
describe ContainerController do
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
    container_project = ContainerProject.create(:ext_management_system => ems)
    container_group = ContainerGroup.create(:ext_management_system => ems,
                                            :container_project     => container_project,
                                            :name                  => "Test Group")
    container = FactoryBot.create(:container, :container_group => container_group, :name => "Test Container")

    get :show, :params => { :id => container.id }
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
    expect(assigns(:breadcrumbs)).to eq([{:name => "Containers",
                                          :url  => "/container/show_list?page=&refresh=y"},
                                         {:name => "Test Container (Summary)",
                                          :url  => "/container/show/#{container.id}"}])
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user_with_group)

      ems = FactoryBot.create(:ems_kubernetes)
      container_project = ContainerProject.create(:ext_management_system => ems)
      container_group = ContainerGroup.create(:ext_management_system => ems,
                                              :container_project     => container_project,
                                              :name                  => "Test Group")
      @container = FactoryBot.create(:container, :container_group => container_group, :name => "Test Container")
    end

    context "render listnav partial" do
      render_views

      it "correctly for summary page" do
        get :show, :params => {:id => @container.id}

        expect(response.status).to eq(200)
        expect(response).to render_template('layouts/_textual_groups_generic')
      end

      it "correctly for timeline page" do
        get :show, :params => {:id => @container.id, :display => 'timeline'}

        expect(response.status).to eq(200)
      end
    end
  end

  it "renders show_list" do
    session[:settings] = {:default_search => 'foo',
                          :views          => {:container => 'list'},
                          :perpage        => {:list => 10}}
    EvmSpecHelper.create_guid_miq_server_zone

    get :show_list
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end
end
