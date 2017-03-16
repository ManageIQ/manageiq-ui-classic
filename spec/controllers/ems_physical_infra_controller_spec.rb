describe EmsPhysicalInfraController do
  include CompressedIds

  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryGirl.build(:zone) }

  describe '#button' do
    include_examples :ems_common_button_examples
  end

  describe "#new" do
    let!(:user) { stub_user(:features => :all) }

    before do
      allow(user).to receive(:server_timezone).and_return("UTC")
    end

    it "adds a new provider" do
      controller.instance_variable_set(:@breadcrumbs, [])
      get :new
      expect(response.status).to eq(200)
    end
  end

  describe "#show" do
    render_views
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      @ems = FactoryGirl.create(:ems_physical_infra)
    end

    let(:url_params) { {} }

    subject { get :show, :params => {:id => @ems.id}.merge(url_params) }

    context "display=timeline" do
      let(:url_params) { {:display => 'timeline'} }
      it { is_expected.to have_http_status 200 }
    end

    context "render listnav partial" do
      render_views

      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_ems_physical_infra")
      end
    end

    it "shows associated datastores" do
      @datastore = FactoryGirl.create(:storage, :name => 'storage_name')
      @datastore.parent = @ems
      controller.instance_variable_set(:@breadcrumbs, [])
      get :show, :params => {:id => @ems.id, :display => 'storages'}
      expect(response.status).to eq(200)
      expect(response).to render_template('shared/views/ems_common/show')
      expect(assigns(:breadcrumbs)).to eq([{:name => "#{@ems.name} (All Datastores)",
                                            :url => "/ems_physical_infra/#{@ems.id}?display=storages"}])

      # display needs to be saved to session for GTL pagination and such
      expect(session[:ems_physical_infra_display]).to eq('storages')
    end

    it " can tag associated datastores" do
      stub_user(:features => :all)
      datastore = FactoryGirl.create(:storage, :name => 'storage_name')
      datastore.parent = @ems
      controller.instance_variable_set(:@_orig_action, "x_history")
      get :show, :params => {:id => @ems.id, :display => 'storages'}
      post :button, :params => {:id              => @ems.id,
                                :display         => 'storages',
                                :miq_grid_checks => to_cid(datastore.id),
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
    before(:each) do
      stub_user(:features => :all)
      FactoryGirl.create(:ems_vmware)
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
      it "shows 'Physical Infrastructure Providers -> (Summary)' breadcrumb path" do
        ems = FactoryGirl.create("ems_physical_infra")
        get :show, :params => { :id => ems.id }
        breadcrumbs = controller.instance_variable_get(:@breadcrumbs)
        expect(breadcrumbs).to eq([{:name => "Physical Infrastructure Providers",
                                    :url  => "/ems_physical_infra/show_list?page=&refresh=y"},
                                   {:name => "#{ems.name} (Summary)",
                                    :url  => "/ems_physical_infra/#{ems.id}"}])
      end
    end
  end

  describe "#build_credentials" do
    before(:each) do
      @ems = FactoryGirl.create(:ems_physical_infra)
    end
    context "#build_credentials only contains credentials that it supports and has a username for in params" do
      let(:default_creds) { {:userid => "default_userid", :password => "default_password"} }

      it "uses the passwords from params for validation if they exist" do
        controller.instance_variable_set(:@_params,
                                         :default_userid       => default_creds[:userid],
                                         :default_password     => default_creds[:password])
        expect(controller.send(:build_credentials, @ems, :validate)).to eq(:default     => default_creds.merge!(:save => false))
      end

      it "uses the stored passwords for validation if passwords dont exist in params" do
        controller.instance_variable_set(:@_params,
                                         :default_userid     => default_creds[:userid])
        expect(@ems).to receive(:authentication_password).and_return(default_creds[:password])
        expect(controller.send(:build_credentials, @ems, :validate)).to eq(:default     => default_creds.merge!(:save => false))
      end
    end
  end

  describe "Lenovo XClarity (lenovo_ph_infra) - create, update, validate, cancel" do
    before do
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
      login_as FactoryGirl.create(:user, :features => "ems_physical_infra_new")
    end

    render_views

    it 'creates on post' do
      expect do
        post :create, :params => {
          "button"                    => "add",
          "name"                      => "foo",
          "emstype"                   => "lenovo_ph_infra",
          "zone"                      => zone.name,
          "cred_type"                 => "default",
          "default_hostname"          => "foo.com",
          "default_userid"            => "foo",
          "default_password"          => "[FILTERED]",
          "default_verify"            => "[FILTERED]"
        }
      end.to change { ManageIQ::Providers::PhysicalInfraManager.count }.by(1)
    end

    it 'creates and updates an authentication record on post' do
      expect do
        post :create, :params => {
          "button"                    => "add",
          "name"                      => "foo_lenovo_ph_infra",
          "emstype"                   => "lenovo_ph_infra",
          "zone"                      => zone.name,
          "cred_type"                 => "default",
          "default_hostname"          => "foo.com",
          "default_userid"            => "foo",
          "default_password"          => "[FILTERED]",
          "default_verify"            => "[FILTERED]"
        }
      end.to change { Authentication.count }.by(1)

      expect(response.status).to eq(200)
      lenovo_ph_infra = ManageIQ::Providers::PhysicalInfraManager.where(:name => "foo_lenovo_ph_infra").first
      expect(lenovo_ph_infra.authentications.size).to eq(1)

      expect do
        post :update, :params => {
          "id"               => lenovo_ph_infra.id,
          "button"           => "save",
          "default_hostname" => "host_lenovo_ph_infra_updated",
          "name"             => "foo_lenovo_ph_infra",
          "emstype"          => "lenovo_ph_infra",
          "default_userid"   => "bar",
          "default_password" => "[FILTERED]",
          "default_verify"   => "[FILTERED]"
        }
      end.not_to change { Authentication.count }

      expect(response.status).to eq(200)
      expect(lenovo_ph_infra.authentications.first).to have_attributes(:userid => "bar", :password => "[FILTERED]")
    end

    it "validates credentials for a new record" do
      post :create, :params => {
        "button"           => "validate",
        "cred_type"        => "default",
        "name"             => "foo_lenovo_ph_infra",
        "emstype"          => "lenovo_ph_infra",
        "zone"             => zone.name,
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
        "default_verify"   => "[FILTERED]"
      }

      expect(response.status).to eq(200)
    end

    it "cancels a new record" do
      post :create, :params => {
        "button"           => "cancel",
        "cred_type"        => "default",
        "name"             => "foo_lenovo_ph_infra",
        "emstype"          => "lenovo_ph_infra",
        "zone"             => zone.name,
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
        "default_verify"   => "[FILTERED]"
      }

      expect(response.status).to eq(200)
    end
  end

  include_examples '#download_summary_pdf', :ems_physical_infra

  it_behaves_like "controller with custom buttons"
end
