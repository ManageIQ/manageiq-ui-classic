describe ContainerNodeController do
  render_views
  before do
    stub_user(:features => :all)
    MiqRegion.seed
  end

  it "renders index" do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  it "renders show screen" do
    EvmSpecHelper.create_guid_miq_server_zone
    ems = FactoryBot.create(:ems_kubernetes)
    container_node = FactoryBot.create(:container_node, :ext_management_system => ems, :name => "Test Node")
    get :show, :params => { :id => container_node.id }
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
    expect(assigns(:breadcrumbs)).to eq([{:name => "Container Nodes",
                                          :url  => "/container_node/show_list?page=&refresh=y"},
                                         {:name => "Test Node (Summary)",
                                          :url  => "/container_node/show/#{container_node.id}"}])
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user)
      @node = FactoryBot.create(:container_node)
    end

    context "render listnav partial" do
      render_views

      it "correctly for summary page" do
        get :show, :params => {:id => @node.id}

        expect(response.status).to eq(200)
        expect(response).to render_template('layouts/_textual_groups_generic')
      end

      it "correctly for timeline page" do
        get :show, :params => {:id => @node.id, :display => 'timeline'}

        expect(response.status).to eq(200)
      end
    end
  end

  describe "#button" do
    let(:node) { FactoryBot.create(:container_node) }

    context "container_node_check_compliance" do
      before do
        EvmSpecHelper.create_guid_miq_server_zone
        login_as FactoryBot.create(:user)
      end

      it 'displays a flash message' do
        post :button, :params => { :pressed => 'container_node_check_compliance', :id => node.id }
        expect(JSON.parse(response.body)['replacePartials']).to have_key('flash_msg_div')
      end
    end
  end

  it "renders show_list" do
    session[:settings] = {:default_search => 'foo',
                          :views          => {:containernode => 'list'},
                          :perpage        => {:list => 10}}
    EvmSpecHelper.create_guid_miq_server_zone

    get :show_list
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end

  include_examples '#download_summary_pdf', :container_node
end
