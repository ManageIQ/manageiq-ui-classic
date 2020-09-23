describe PersistentVolumeController do
  render_views
  before do
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

  let(:ems) { FactoryBot.create(:ems_openshift) }
  let(:persistent_volume) { PersistentVolume.create(:parent => ems, :name => "Test Volume") }

  it "renders grid view" do
    EvmSpecHelper.create_guid_miq_server_zone

    session[:settings] = {
      :views => {:persistentvolume => "grid"}
    }

    post :show_list, :params => {:controller => 'persistent_volume', :id => persistent_volume.id}
    expect(response).to render_template('layouts/react/_gtl')
    expect(response.status).to eq(200)
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
      end
    end
  end
end
