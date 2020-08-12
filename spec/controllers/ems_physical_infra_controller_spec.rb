describe EmsPhysicalInfraController do
  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryBot.build(:zone) }

  describe "#show" do
    render_views
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user, :features => "none")
      @ems = FactoryBot.create(:ems_redfish_physical_infra)
    end

    let(:url_params) { {} }

    subject { get :show, :params => {:id => @ems.id}.merge(url_params) }

    context "display=timeline" do
      let(:url_params) { {:display => 'timeline'} }
      it do
        bypass_rescue
        is_expected.to have_http_status 200
      end
    end

    context "render show dashboard partial" do
      render_views

      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "ems_physical_infra/_show_dashboard")
      end
    end

    it "shows associated datastores" do
      @datastore = FactoryBot.create(:storage, :name => 'storage_name')
      @datastore.parent = @ems
      controller.instance_variable_set(:@breadcrumbs, [])
      get :show, :params => {:id => @ems.id, :display => 'storages'}
      expect(response.status).to eq(200)
      expect(response).to render_template('shared/views/ems_common/show')
      expect(assigns(:breadcrumbs)).to eq([{:name => "#{@ems.name} (All Datastores)",
                                            :url  => "/ems_physical_infra/#{@ems.id}?display=storages"}])

      # display needs to be saved to session for GTL pagination and such
      expect(session[:ems_physical_infra_display]).to eq('storages')
    end

    it " can tag associated datastores" do
      stub_user(:features => :all)
      datastore = FactoryBot.create(:storage, :name => 'storage_name')
      datastore.parent = @ems
      controller.instance_variable_set(:@_orig_action, "x_history")
      get :show, :params => {:id => @ems.id, :display => 'storages'}
      post :button, :params => {:id              => @ems.id,
                                :display         => 'storages',
                                :miq_grid_checks => datastore.id,
                                :pressed         => "storage_tag",
                                :format          => :js}
      expect(response.status).to eq(200)
      _breadcrumbs = controller.instance_variable_get(:@breadcrumbs)
      expect(assigns(:breadcrumbs)).to eq([{:name => "#{@ems.name} (All Datastores)",
                                            :url  => "/ems_physical_infra/#{@ems.id}?display=storages"},
                                           {:name => "Tag Assignment", :url => "//tagging_edit"}])
    end
  end

  describe "#show_list" do
    before do
      stub_user(:features => :all)
      FactoryBot.create(:ems_vmware)
      get :show_list
    end
    it { expect(response.status).to eq(200) }
  end

  describe "breadcrumbs path on a 'show' page of an Physical Infrastructure Provider accessed from Dashboard maintab" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end
    context "when previous breadcrumbs path contained 'Cloud Providers'" do
      it "shows 'Physical Infrastructure Providers -> (Dashboard)' breadcrumb path" do
        ems = FactoryBot.create(:ems_physical_infra)
        get :show, :params => { :id => ems.id }
        breadcrumbs = controller.instance_variable_get(:@breadcrumbs)
        expect(breadcrumbs).to eq([{:name => "#{ems.name} (Dashboard)", :url => "/ems_physical_infra/#{ems.id}"}])
      end
    end
  end

  describe "When the console button is pressed" do
    before do
      allow(controller).to receive(:launch_console).and_return(true)
    end

    it "redirects to new url" do
      post :launch_console
      expect(response.status).to eq(302)
    end
  end
  include_examples '#download_summary_pdf', :ems_physical_infra

  it_behaves_like "controller with custom buttons"
end
