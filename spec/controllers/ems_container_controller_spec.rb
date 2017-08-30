describe EmsContainerController do
  before(:each) do
    stub_user(:features => :all)
  end

  it "#new" do
    controller.instance_variable_set(:@breadcrumbs, [])
    get :new

    expect(response.status).to eq(200)
  end

  describe "#show" do
    before do
      session[:settings] = {:views => {}, :quadicons => {}}
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      @container = FactoryGirl.create(:ems_kubernetes)
    end

    context "render" do
      subject { get :show, :params => { :id => @container.id } }
      render_views
      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'ems_container/_show_dashboard')
      end

      it "renders topology view" do
        get :show, :params => { :id => @container.id, :display => 'topology' }
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
        expect(response).to render_template('container_topology/show')
      end
    end

    context "render dashboard" do
      subject { get :show, :params => { :id => @container.id, :display => 'dashboard' } }
      render_views

      it 'never render template show' do
        is_expected.not_to render_template('shared/views/ems_common/show')
      end

      it 'never render listnav' do
        is_expected.not_to render_template(:partial => "layouts/listnav/_ems_container")
      end

      it 'uses its own template' do
        is_expected.to have_http_status 200
        is_expected.not_to render_template(:partial => "ems_container/show_dashboard")
      end
    end
  end

  describe ".update_ems_button_detect" do
    let(:kubernetes_manager) { FactoryGirl.create(:ems_kubernetes) }
    let(:openshift_manager) { FactoryGirl.create(:ems_openshift) }
    let(:hawkular_route) { RecursiveOpenStruct.new(:spec => {:host => "myhawkularroute.com"}) }
    let(:mock_client) { double('kubeclient') }

    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    it "errors on kubernetes detection" do
      controller.instance_variable_set(:@_params, :id => kubernetes_manager.id)
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)

      controller.send(:update_ems_button_detect)

      expect(controller.send(:flash_errors?)).to be_truthy
      expect(assigns(:flash_array).first[:message]).to eq(
        'Hawkular Route Detection: failure [Route detection not applicable for provider type]'
      )
    end

    it "detects route for openshift" do
      controller.instance_variable_set(:@_params, :id => openshift_manager.id)
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)

      # set kubeclient to return a mock route.
      allow(Kubeclient::Client).to receive(:new).and_return(mock_client)
      expect(mock_client).to receive(:get_route).with('hawkular-metrics', 'openshift-infra')
        .and_return(hawkular_route)

      controller.send(:update_ems_button_detect)

      expect(controller.send(:flash_errors?)).to be_falsey
      expect(assigns(:flash_array).first[:message]).to eq('Hawkular Route Detection: success')
    end

    it "tolerates detection exceptions" do
      controller.instance_variable_set(:@_params, :id => openshift_manager.id)
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)

      # set kubeclient to return a mock route.
      allow(Kubeclient::Client).to receive(:new).and_return(mock_client)
      expect(mock_client).to receive(:get_route).with('hawkular-metrics', 'openshift-infra')
        .and_raise(StandardError, "message")

      controller.send(:update_ems_button_detect)

      expect(controller.send(:flash_errors?)).to be_truthy
      expect(assigns(:flash_array).first[:message]).to include(
        'Hawkular Route Detection: failure [message]'
      )
    end
  end

  describe "Hawkular Disabled/Enabled" do
    let(:zone) { FactoryGirl.build(:zone) }
    let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }

    before do
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
    end

    it "Creates a provider with only one endpoint if hawkular is disabled" do
      post :create, :params => {
        "button"                    => "add",
        "cred_type"                 => "hawkular",
        "name"                      => "openshift_no_hawkular",
        "emstype"                   => "openshift",
        "zone"                      => 'default',
        "default_security_protocol" => "ssl-without-validation",
        "default_hostname"          => "default_hostname",
        "default_api_port"          => "5000",
        "default_userid"            => "",
        "default_password"          => "",
        "provider_region"           => "",
        "metrics_selection"         => "hawkular_disabled"
      }
      expect(response.status).to eq(200)
      ems_openshift = ManageIQ::Providers::ContainerManager.first
      expect(ems_openshift.endpoints.pluck(:role)).to contain_exactly('default')
    end

    it "Creates a provider with two endpoints if hawkular is enabled" do
      post :create, :params => {
        "button"                    => "add",
        "cred_type"                 => "hawkular",
        "name"                      => "openshift_no_hawkular",
        "emstype"                   => "openshift",
        "zone"                      => 'default',
        "default_security_protocol" => "ssl-without-validation",
        "default_hostname"          => "default_hostname",
        "default_api_port"          => "5000",
        "default_userid"            => "",
        "default_password"          => "",
        "provider_region"           => "",
        "metrics_selection"         => "hawkular",
        "metrics_security_protocol" => "ssl-without-validation",
        "metrics_hostname"          => "hawkular_hostname",
        "metrics_api_port"          => "443",
      }
      expect(response.status).to eq(200)
      ems_openshift = ManageIQ::Providers::ContainerManager.first
      expect(ems_openshift.endpoints.count).to be(2)
      expect(ems_openshift.endpoints.pluck(:role)).to contain_exactly('default', 'hawkular')
    end
  end

  include_examples '#download_summary_pdf', :ems_kubernetes
end
