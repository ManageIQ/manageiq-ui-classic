describe EmsContainerController do
  before do
    stub_user(:features => :all)
  end

  it "#new" do
    controller.instance_variable_set(:@breadcrumbs, [])
    get :new

    expect(response.status).to eq(200)
  end

  describe "#show" do
    before do
      session[:settings] = {:views => {}}
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user)
      @container = FactoryBot.create(:ems_kubernetes)
    end

    context "render" do
      subject { get :show, :params => { :id => @container.id } }
      render_views
      it do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => 'ems_container/_show_dashboard')
      end

      it "listnav correctly for timeline" do
        get :show, :params => { :id => @container.id, :display => 'timeline' }
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "layouts/listnav/_ems_container")
      end

      it "renders topology view" do
        get :show, :params => { :id => @container.id, :display => 'topology' }
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
        expect(response).to render_template('container_topology/show')
      end

      it "renders ad hoc view" do
        get :show, :params => { :id => @container.id, :display => 'ad_hoc_metrics' }
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
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
    let(:kubernetes_manager) { FactoryBot.create(:ems_kubernetes) }
    let(:openshift_manager) { FactoryBot.create(:ems_openshift) }
    let(:hawkular_route) { RecursiveOpenStruct.new(:spec => {:host => "myhawkularroute.com"}) }
    let(:mock_client) { double('kubeclient') }

    context "with route set" do
      before do
        EvmSpecHelper.create_guid_miq_server_zone
        # set kubeclient to return a mock route.
        allow(Kubeclient::Client).to receive(:new).and_return(mock_client)
        expect(mock_client).to receive(:discover).at_least(:once)
      end

      it "detects openshift hawkular metric route" do
        controller.params = {:id                => openshift_manager.id,
                             :current_tab       => "metrics",
                             :metrics_selection => 'hawkular'}
        controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)

        expect(mock_client).to receive(:get_route).with('hawkular-metrics', 'openshift-infra')
                                 .and_return(hawkular_route)

        ret = JSON.parse(controller.send(:update_ems_button_detect))

        expect(ret["hostname"]).to eq("myhawkularroute.com")
        expect(controller.send(:flash_errors?)).to be_falsey
        expect(assigns(:flash_array).first[:message]).to eq('Route Detection: success')
      end

      it "detects openshift prometheus metric route" do
        controller.params = {:id                => openshift_manager.id,
                             :current_tab       => "metrics",
                             :metrics_selection => 'prometheus'}
        controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)

        expect(mock_client).to receive(:get_route).with('prometheus', 'openshift-metrics')
                                 .and_return(RecursiveOpenStruct.new(:spec => {:host => "prometheus-metrics.example.com"}))

        ret = JSON.parse(controller.send(:update_ems_button_detect))

        expect(ret["hostname"]).to eq("prometheus-metrics.example.com")
        expect(controller.send(:flash_errors?)).to be_falsey
        expect(assigns(:flash_array).first[:message]).to eq('Route Detection: success')
      end

      it "detects openshift prometheus alert route" do
        require 'kubeclient'
        controller.params = {:id          => openshift_manager.id,
                             :current_tab => "alerts"}
        controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)

        expect(mock_client).to receive(:get_route).with('alerts', 'openshift-metrics')
                                 .and_return(RecursiveOpenStruct.new(:spec => {:host => "prometheus-alerts.example.com"}))

        ret = JSON.parse(controller.send(:update_ems_button_detect))

        expect(ret["hostname"]).to eq("prometheus-alerts.example.com")
        expect(controller.send(:flash_errors?)).to be_falsey
        expect(assigns(:flash_array).first[:message]).to eq('Route Detection: success')
      end

      it "tolerates detection exceptions" do
        controller.params = {:id                => openshift_manager.id,
                             :current_tab       => "metrics",
                             :metrics_selection => 'hawkular'}
        controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)

        expect(mock_client).to receive(:get_route).with('hawkular-metrics', 'openshift-infra')
                                 .and_raise(StandardError, "message")

        controller.send(:update_ems_button_detect)

        expect(controller.send(:flash_errors?)).to be_truthy
        expect(assigns(:flash_array).first[:message]).to include(
                                                           'Route Detection: failure [message]'
                                                         )
      end
    end

    it "errors on kubernetes detection" do
      EvmSpecHelper.create_guid_miq_server_zone
      controller.params = {:id => kubernetes_manager.id}
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)

      controller.send(:update_ems_button_detect)

      expect(controller.send(:flash_errors?)).to be_truthy
      expect(assigns(:flash_array).first[:message]).to eq(
        'Route Detection: failure [Route detection not applicable for provider type]'
      )
    end
  end

  describe "create with provider options" do
    let(:zone) { FactoryBot.build(:zone) }
    let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }

    before do
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
    end

    it "Creates a provider with provider options" do
      params = {
        "button"                    => "add",
        "name"                      => "openshift_no_hawkular",
        "emstype"                   => "openshift",
        "zone"                      => zone.name,
        "default_security_protocol" => "ssl-without-validation",
        "default_hostname"          => "openstack.default.example.com",
        "default_api_port"          => "5000",
        "default_userid"            => "",
        "default_password"          => "",
        "provider_region"           => "",
        "metrics_selection"         => "hawkular_disabled",
      }
      params["provider_options_image_inspector_options_http_proxy"] = "hello.com"
      post :create, :params => params
      expect(response.status).to eq(200)
      ems_openshift = ManageIQ::Providers::ContainerManager.first
      expect(ems_openshift.options[:image_inspector_options][:http_proxy]).to eq("hello.com")
    end
  end

  describe "Hawkular Disabled/Enabled" do
    let(:zone) { FactoryBot.build(:zone) }
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
        "zone"                      => zone.name,
        "default_security_protocol" => "ssl-without-validation",
        "default_hostname"          => "openstack.default.example.com",
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
        "zone"                      => zone.name,
        "default_security_protocol" => "ssl-without-validation",
        "default_hostname"          => "hawkular.default.example.com",
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

  describe "Kubevirt Disabled/Enabled" do
    let(:zone) { FactoryBot.build(:zone) }
    let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }

    before do
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
    end

    context "Provider creation" do
      it "Creates a provider with only one endpoint if kubevirt is disabled" do
        post :create, :params => {
          "button"                    => "add",
          "cred_type"                 => "kubevirt",
          "name"                      => "openshift_no_kubevirt",
          "emstype"                   => "openshift",
          "zone"                      => zone.name,
          "default_security_protocol" => "ssl-without-validation",
          "default_hostname"          => "openstack.default.example.com",
          "default_api_port"          => "5000",
          "default_userid"            => "",
          "default_password"          => "",
          "provider_region"           => "",
          "virtualization_selection"  => "disabled"
        }
        expect(response.status).to eq(200)
        ems_openshift = ManageIQ::Providers::ContainerManager.first
        expect(ems_openshift.endpoints.pluck(:role)).to contain_exactly('default')
      end

      it "Creates a provider with two endpoints if kubevirt is enabled" do
        post :create, :params => {
          "button"                     => "add",
          "cred_type"                  => "kubevirt",
          "name"                       => "openshift_with_kubevirt",
          "emstype"                    => "openshift",
          "zone"                       => zone.name,
          "default_security_protocol"  => "ssl-without-validation",
          "default_hostname"           => "server.example.com",
          "default_api_port"           => "5000",
          "default_userid"             => "",
          "default_password"           => "",
          "provider_region"            => "",
          "virtualization_selection"   => "kubevirt",
          "kubevirt_security_protocol" => "ssl-without-validation",
          "kubevirt_hostname"          => "server.example.com",
          "kubevirt_api_port"          => "5000",
        }
        expect(response.status).to eq(200)
        ems_openshift = ManageIQ::Providers::ContainerManager.first
        expect(ems_openshift.endpoints.count).to be(2)
        expect(ems_openshift.endpoints.pluck(:role)).to contain_exactly('default', 'kubevirt')
      end
    end

    context "Provider update with kubevirt provider" do
      context "update when virtualization selection is enabled" do
        before do
          stub_user(:features => :all)
          session[:edit] = assigns(:edit)
        end

        def test_setting_many_fields
          controller.params = {:name                       => 'EMS 2',
                               :default_userid             => '_',
                               :default_hostname           => '10.10.10.11',
                               :default_api_port           => '5000',
                               :default_security_protocol  => 'ssl-with-validation-custom-ca',
                               :default_tls_ca_certs       => '-----BEGIN DUMMY...',
                               :default_password           => 'valid-token',
                               :virtualization_selection   => 'kubevirt',
                               :kubevirt_hostname          => '10.10.10.11',
                               :kubevirt_api_port          => '5000',
                               :kubevirt_security_protocol => 'ssl-with-validation-custom-ca',
                               :kubevirt_tls_ca_certs      => '-----BEGIN DUMMY...',
                               :kubevirt_password          => 'other-valid-token',
                               :emstype                    => @type}
          controller.send(:set_ems_record_vars, @ems)
          expect(@flash_array).to be_nil
          cc = @ems.connection_configurations

          # verify default endpoint expectations
          expect(cc.default.endpoint.hostname).to eq('10.10.10.11')
          expect(cc.default.endpoint.port).to eq(5000)
          expect(cc.default.endpoint.security_protocol).to eq('ssl-with-validation-custom-ca')
          expect(cc.default.endpoint.verify_ssl?).to eq(true)
          expect(cc.default.endpoint.certificate_authority).to eq('-----BEGIN DUMMY...')

          # verify kubevirt endpoint expectations
          expect(cc.kubevirt.endpoint.hostname).to eq('10.10.10.11')
          expect(cc.kubevirt.endpoint.port).to eq(5000)
          expect(cc.kubevirt.endpoint.security_protocol).to eq('ssl-with-validation-custom-ca')
          expect(cc.kubevirt.endpoint.verify_ssl?).to eq(true)
          expect(cc.kubevirt.endpoint.certificate_authority).to eq('-----BEGIN DUMMY...')

          # verify authentications for default and kubevirt providers
          expect(@ems.authentication_token("default")).to eq('valid-token')
          expect(@ems.authentication_token("kubevirt")).to eq('other-valid-token')
          expect(@ems.hostname).to eq('10.10.10.11')
        end

        def test_setting_few_fields
          controller.remove_instance_variable(:@_params)
          controller.params = {:name => 'EMS 3', :default_userid => '_'}
          controller.send(:set_ems_record_vars, @ems)
          expect(@flash_array).to be_nil
          expect(@ems.authentication_token("default")).to eq('valid-token')
          expect(@ems.authentication_type("default")).to be_nil
        end

        it "when editing kubernetes EMS" do
          @type = 'kubernetes'
          @ems  = ManageIQ::Providers::Kubernetes::ContainerManager.new
          test_setting_many_fields

          test_setting_few_fields
          expect(@ems.connection_configurations.kubevirt.endpoint.hostname).to eq('10.10.10.11')
        end

        it "when editing openshift EMS" do
          @type = 'openshift'
          @ems  = ManageIQ::Providers::Openshift::ContainerManager.new
          test_setting_many_fields

          test_setting_few_fields
          expect(@ems.connection_configurations.kubevirt.endpoint.hostname).to eq('10.10.10.11')
        end
      end
    end
  end

  include_examples '#download_summary_pdf', :ems_kubernetes
  %w(container_projects container_nodes container_images container_volumes
     container_templates).each do |custom_button_class|
    include_examples "relationship table screen with custom buttons", custom_button_class
  end
end
