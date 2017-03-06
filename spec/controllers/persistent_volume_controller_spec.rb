describe PersistentVolumeController do
  render_views
  before(:each) do
    stub_user(:features => :all)
  end

  it "renders index" do
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'show_list')
  end

  it "renders show_list" do
    session[:settings] = {:default_search => 'foo',
                          :views          => {:persistentvolume => 'list'},
                          :perpage        => {:list => 10}}

    EvmSpecHelper.create_guid_miq_server_zone

    get :show_list
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end

  let(:ems) { FactoryGirl.create(:ems_openshift) }
  let(:persistent_volume) { PersistentVolume.create(:parent => ems, :name => "Test Volume") }

  it "renders grid view" do
    EvmSpecHelper.create_guid_miq_server_zone

    session[:settings] = {
      :views => {:persistentvolume => "grid"}
    }

    post :show_list, :params => {:controller => 'persistent_volume', :id => persistent_volume.id}
    expect(response).to render_template('layouts/angular/_gtl')
    expect(response.status).to eq(200)
  end

  it "Controller method is called with correct parameters" do
    controller.params[:type] = "tile"
    controller.instance_variable_set(:@settings, :views => {:persistentvolume => "list"})
    expect(controller).to receive(:get_view_calculate_gtl_type).with(:persistentvolume) do
      expect(controller.instance_variable_get(:@settings)).to include(:views => {:persistentvolume => "tile"})
    end
    controller.send(:get_view, "PersistentVolume", :gtl_dbname => :persistentvolume)
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    subject do
      get :show, :params => {:id => persistent_volume.id}
    end

    context "render" do
      render_views
      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'layouts/_textual_groups_generic')
        is_expected.to render_template(:partial => 'layouts/listnav/_persistent_volume')
      end
    end
  end
end
