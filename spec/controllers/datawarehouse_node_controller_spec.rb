describe DatawarehouseNodeController do
  render_views
  before(:each) do
    stub_user(:features => :all)
  end

  it "renders index" do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  it "renders show screen" do
    EvmSpecHelper.create_guid_miq_server_zone
    ems = FactoryGirl.create(:ems_elasticsearch_datawarehouse)
    datawarehouse_node = FactoryGirl.create(:datawarehouse_node, :ext_management_system => ems, :name => "Test Node")
    get :show, :params => { :id => datawarehouse_node.id }
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
    expect(assigns(:breadcrumbs)).to eq([{:name => "Datawarehouse Nodes",
                                          :url  => "/datawarehouse_node/show_list?page=&refresh=y"},
                                         {:name => "Test Node (Summary)",
                                          :url  => "/datawarehouse_node/show/#{datawarehouse_node.id}"}])
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      @node = FactoryGirl.create(:datawarehouse_node)
    end

    subject { get :show, :id => @node.id }

    context "render" do
      render_views

      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_datawarehouse_node")
      end
    end
  end

  it "renders show_list" do
    session[:settings] = {:default_search => 'foo',
                          :views          => {:datawarehousenode => 'list'},
                          :perpage        => {:list => 10}}
    EvmSpecHelper.create_guid_miq_server_zone

    get :show_list
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end
end
