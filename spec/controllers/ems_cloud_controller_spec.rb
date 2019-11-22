describe EmsCloudController do
  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryBot.build(:zone) }

  describe "#create" do
    before do
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
      login_as FactoryBot.create(:user, :features => "ems_cloud_new")
    end

    it "adds a new provider" do
      controller.instance_variable_set(:@breadcrumbs, [])
      get :new
      expect(response.status).to eq(200)
    end

    render_views

    it 'shows the edit page' do
      get :edit, :params => { :id => FactoryBot.create(:ems_amazon).id }
      expect(response.status).to eq(200)
    end

    it 'creates on post' do
      expect do
        post :create, :params => {
          "button"           => "add",
          "name"             => "foo",
          "emstype"          => "ec2",
          "provider_region"  => "ap-southeast-1",
          "port"             => "",
          "zone"             => zone.name,
          "default_userid"   => "foo",
          "default_password" => "[FILTERED]",
          "default_url"      => "http://abc.test/path"
        }
      end.to change { ManageIQ::Providers::Amazon::CloudManager.count }.by(1)
    end

    it 'creates and updates an authentication record on post' do
      expect do
        post :create, :params => {
          "button"           => "add",
          "default_hostname" => "openstack.example.com",
          "name"             => "foo_openstack",
          "emstype"          => "openstack",
          "provider_region"  => "",
          "default_port"     => "5000",
          "zone"             => zone.name,
          "default_userid"   => "foo",
          "default_password" => "[FILTERED]",
        }
      end.to change { Authentication.count }.by(1)

      expect(response.status).to eq(200)
      openstack = ManageIQ::Providers::Openstack::CloudManager.where(:name => "foo_openstack").first
      expect(openstack.authentications.size).to eq(1)

      expect do
        post :update, :params => {
          "id"               => openstack.id,
          "button"           => "save",
          "default_hostname" => "openstack.example.com",
          "name"             => "foo_openstack",
          "emstype"          => "openstack",
          "provider_region"  => "",
          "default_port"     => "5000",
          "default_userid"   => "bar",
          "default_password" => "[FILTERED]",
        }
      end.not_to change { Authentication.count }

      expect(response.status).to eq(200)
      expect(openstack.authentications.first).to have_attributes(:userid => "bar", :password => "[FILTERED]")
    end

    it "validates credentials for a new record" do
      expect(ManageIQ::Providers::Amazon::CloudManager).to receive(:validate_credentials_task).with(
        match_array([
          'foo',
          'v2:{SRpWIJC0Y1AOrUrKC0KDiw==}',
          :EC2,
          'ap-southeast-1',
          nil,
          true,
          instance_of(URI::Generic),
          :assume_role => nil,
        ]),
        User.current_user.userid,
        zone.name
      )

      post :create, :params => {
        "button"           => "validate",
        "cred_type"        => "default",
        "name"             => "foo_ec2",
        "emstype"          => "ec2",
        "provider_region"  => "ap-southeast-1",
        "zone"             => zone.name,
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
        "default_url"      => ""
      }

      expect(response.status).to eq(200)
    end

    it "cancels a new record" do
      post :create, :params => {
        "button"           => "cancel",
        "cred_type"        => "default",
        "name"             => "foo_ec2",
        "emstype"          => "ec2",
        "provider_region"  => "ap-southeast-1",
        "zone"             => "default",
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
      }

      expect(response.status).to eq(200)
    end

    it "adds a record of type azure" do
      post :create, :params => {
        "button"           => "add",
        "azure_tenant_id"  => "azure",
        "name"             => "foo_azure",
        "emstype"          => "azure",
        "zone"             => zone.name,
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
        "default_url"      => "http://abc.test/path"
      }

      expect(response.status).to eq(200)
      edit = controller.instance_variable_get(:@edit)
      expect(edit[:new][:azure_tenant_id]).to eq("azure")
    end
  end

  describe "#ems_cloud_form_fields" do
    before do
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
    end

    it 'gets the ems cloud form fields on a get' do
      Zone.seed
      post :create, :params => {
        "button"           => "add",
        "default_hostname" => "openstack.example.com",
        "name"             => "foo_openstack",
        "emstype"          => "openstack",
        "provider_region"  => "",
        "default_port"     => "5000",
        "zone"             => zone.name,
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
      }

      expect(response.status).to eq(200)
      openstack = ManageIQ::Providers::Openstack::CloudManager.where(:name => "foo_openstack").first
      get :ems_cloud_form_fields, :params => { "id" => openstack.id }
      expect(response.status).to eq(200)
      expect(response.body).to include('"name":"foo_openstack"')
    end

    let(:openstack_form_params) do
      {
        "button"                 => "add",
        "default_hostname"       => "openstack.example.com",
        "name"                   => "foo_openstack",
        "emstype"                => "openstack",
        "tenant_mapping_enabled" => "on",
        "provider_region"        => "",
        "default_port"           => "5000",
        "zone"                   => zone.name,
        "default_userid"         => "foo",
        "default_password"       => "[FILTERED]",
      }
    end

    it "creates openstack cloud manager with attributes from form" do
      post :create, :params => openstack_form_params

      openstack = ManageIQ::Providers::Openstack::CloudManager.where(:name => "foo_openstack").first

      expect(openstack.zone.name).to eq(zone.name)
      expect(openstack.name).to eq("foo_openstack")
      expect(openstack.emstype).to eq("openstack")
      expect(openstack.tenant_mapping_enabled).to be_truthy
      expect(openstack.provider_region).to eq("")
    end

    it "updates openstack cloud manager's attribute tenant_mapping_enabled" do
      post :create, :params => openstack_form_params

      openstack = ManageIQ::Providers::Openstack::CloudManager.where(:name => "foo_openstack").first
      openstack_form_params[:id] = openstack.id
      openstack_form_params[:button] = "save"
      openstack_form_params[:tenant_mapping_enabled] = "off"

      post :update, :params => openstack_form_params

      expect(openstack.reload.tenant_mapping_enabled).to be_falsey
    end

    it 'strips whitespace from name, hostname and api_port form fields on create' do
      post :create, :params => {
        "button"           => "add",
        "default_hostname" => "openstack.example.com",
        "name"             => "  foo_openstack     ",
        "emstype"          => "openstack",
        "provider_region"  => "",
        "default_api_port" => "   5000     ",
        "zone"             => zone.name,
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
      }
      expect(response.status).to eq(200)
      expect(ManageIQ::Providers::Openstack::CloudManager.with_hostname('openstack.example.com')
                                                         .with_port('5000')
                                                         .where(:name => 'foo_openstack')
                                                         .count).to eq(1)
    end
  end

  describe "#show_link" do
    before do
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
    end

    it 'gets the restful show link and timeline link paths' do
      session[:settings] = {:views => {:vm_summary_cool => ""}}
      post :create, :params => {
        "button"           => "add",
        "default_hostname" => "openstack.example.com",
        "name"             => "foo_openstack",
        "emstype"          => "openstack",
        "provider_region"  => "",
        "default_port"     => "5000",
        "zone"             => zone.name,
        "default_userid"   => "foo",
        "default_password" => "[FILTERED]",
      }

      expect(response.status).to eq(200)
      openstack = ManageIQ::Providers::Openstack::CloudManager.where(:name => "foo_openstack").first
      show_link_actual_path = controller.send(:show_link, openstack)
      expect(show_link_actual_path).to eq("/ems_cloud/#{openstack.id}")

      post :show, :params => {
        "button"  => "timeline",
        "display" => "timeline",
        "id"      => openstack.id
      }

      expect(response.status).to eq(200)
      show_link_actual_path = controller.send(:show_link, openstack, :display => "timeline")
      expect(show_link_actual_path).to eq("/ems_cloud/#{openstack.id}?display=timeline")
    end
  end

  describe "#build_credentials only contains credentials that it supports and has a username for in params" do
    let(:mocked_ems)    { double(ManageIQ::Providers::Openstack::CloudManager) }
    let(:default_creds) { {:userid => "default_userid", :password => "default_password"} }
    let(:amqp_creds)    { {:userid => "amqp_userid",    :password => "amqp_password"} }

    it "uses the passwords from params for validation if they exist" do
      controller.params = {:default_userid   => default_creds[:userid],
                           :default_password => default_creds[:password],
                           :amqp_userid      => amqp_creds[:userid],
                           :amqp_password    => amqp_creds[:password]}
      expect(mocked_ems).to receive(:supports_authentication?).with(:amqp).and_return(true)
      expect(mocked_ems).to receive(:supports_authentication?).with(:oauth)
      expect(mocked_ems).to receive(:supports_authentication?).with(:auth_key)
      expect(mocked_ems).to receive(:supports?).with(:assume_role).and_return(false)
      expect(controller.send(:build_credentials, mocked_ems, :validate)).to eq(:default => default_creds.merge!(:save => false), :amqp => amqp_creds.merge!(:save => false))
    end

    it "uses the stored passwords for validation if passwords dont exist in params" do
      controller.params = {:default_userid => default_creds[:userid],
                           :amqp_userid    => amqp_creds[:userid]}
      expect(mocked_ems).to receive(:authentication_password).and_return(default_creds[:password])
      expect(mocked_ems).to receive(:authentication_password).with(:amqp).and_return(amqp_creds[:password])
      expect(mocked_ems).to receive(:supports_authentication?).with(:amqp).and_return(true)
      expect(mocked_ems).to receive(:supports_authentication?).with(:oauth)
      expect(mocked_ems).to receive(:supports_authentication?).with(:auth_key)
      expect(mocked_ems).to receive(:supports?).with(:assume_role).and_return(false)
      expect(controller.send(:build_credentials, mocked_ems, :validate)).to eq(:default => default_creds.merge!(:save => false), :amqp => amqp_creds.merge!(:save => false))
    end
  end

  describe "#update_ems_button_validate" do
    let(:mocked_ems) { FactoryBot.create(:ems_openstack) }

    it "calls authentication_check with save = false" do
      allow(controller).to receive(:set_ems_record_vars)
      allow(controller).to receive(:render)
      allow(controller).to receive(:find_record_with_rbac).and_return(mocked_ems)
      controller.params = {:button => "validate", :id => mocked_ems.id, :cred_type => "default"}

      expect(mocked_ems).to receive(:authentication_check).with("default", hash_including(:save => false))
      controller.send(:update_ems_button_validate)
    end
  end

  describe "#create_ems_button_validate" do
    let(:mocked_params) { {:controller => mocked_class_controller, :cred_type => "default"} }

    before do
      allow(controller).to receive(:render)
      controller.params = mocked_params
      allow(ExtManagementSystem).to receive(:model_from_emstype).and_return(mocked_class)
    end

    context "with a cloud manager" do
      let(:mocked_class) { ManageIQ::Providers::Amazon::CloudManager }
      let(:mocked_class_controller) { "ems_cloud" }
      let(:mocked_params) { {:controller => mocked_class_controller, :cred_type => "default", :default_url => ""} }

      it "queues the authentication type if it is a cloud provider" do
        expect(mocked_class).to receive(:validate_credentials_task)
        controller.send(:create_ems_button_validate)
      end

      it "does queue the authentication check even if it is a cloud provider with a ui role" do
        session[:selected_roles] = ['user_interface']

        expect(mocked_class).not_to receive(:raw_connect)
        expect(mocked_class).to receive(:validate_credentials_task)
        controller.send(:create_ems_button_validate)
      end

      context "google compute engine" do
        let(:mocked_params)   { {:controller => mocked_class_controller, :cred_type => "default", :project => project, :service_account => service_account} }
        let(:mocked_class)    { ManageIQ::Providers::Google::CloudManager }
        let(:project)         { "gce-project-1" }
        let(:service_account) { "PRIVATE_KEY" }
        let(:compute_service) { {:service => "compute"} }

        it "queues the correct number of arguments" do
          expected_validate_args = [project, ManageIQ::Password.encrypt(service_account), compute_service, nil, true]
          expect(mocked_class).to receive(:validate_credentials_task).with(expected_validate_args, nil, nil)
          controller.send(:create_ems_button_validate)
        end
      end
    end

    context "with an infrastructure manager" do
      let(:mocked_class) { ManageIQ::Providers::Redhat::InfraManager }
      let(:mocked_class_controller) { "ems_infra" }

      it "queues the authentication check" do
        expect(mocked_class).to receive(:validate_credentials_task)
        controller.send(:create_ems_button_validate)
      end

      context "vmware infrastructure manager" do
        let(:mocked_class) { ManageIQ::Providers::Vmware::InfraManager }
        let(:mocked_class_controller) { "ems_infra" }

        it "disables the broker" do
          expected_validate_args = [{:pass => nil, :user => nil, :ip => nil, :use_broker => false}]
          expect(mocked_class).to receive(:validate_credentials_task).with(expected_validate_args, nil, nil)
          controller.send(:create_ems_button_validate)
        end
      end
    end

    context "with a container manager" do
      let(:mocked_class) { ManageIQ::Providers::Openshift::ContainerManager }
      let(:mocked_class_controller) { "ems_container" }
      let(:mocked_container) { double(ManageIQ::Providers::Openshift::ContainerManager) }

      before do
        allow(mocked_class).to receive(:new).and_return(mocked_container)
        allow(controller).to receive(:set_ems_record_vars)
      end

      it "does not queue the authentication check if it is a container provider" do
        expect(mocked_container).to receive(:authentication_check).with("default", hash_including(:save => false))
        controller.send(:create_ems_button_validate)
      end
    end
  end

  describe "#test_toolbars" do
    before do
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
      login_as FactoryBot.create(:user, :features => "ems_cloud_new")
    end

    it "refresh relationships and power states" do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :id => ems.id, :pressed => "ems_cloud_refresh" }
      expect(response.status).to eq(200)
    end

    it 'edit selected cloud provider' do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :miq_grid_checks => ems.id, :pressed => "ems_cloud_edit" }
      expect(response.status).to eq(200)
    end

    it 'edit cloud provider tags' do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :miq_grid_checks => ems.id, :pressed => "ems_cloud_tag" }
      expect(response.status).to eq(200)
    end

    it 'manage cloud provider policies' do
      allow(controller).to receive(:protect_build_tree).and_return(nil)
      controller.instance_variable_set(:@protect_tree, OpenStruct.new(:name => "name", :locals_for_render => {}))
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :miq_grid_checks => ems.id, :pressed => "ems_cloud_protect" }
      expect(response.status).to eq(200)

      get :protect
      expect(response.status).to eq(200)
      expect(response).to render_template('shared/views/protect')
    end

    it 'edit cloud provider tags' do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :id => ems.id, :pressed => "ems_cloud_timeline" }
      expect(response.status).to eq(200)

      get :show, :params => { :display => "timeline", :id => ems.id }
      expect(response.status).to eq(200)
    end

    it 'edit cloud providers' do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :miq_grid_checks => ems.id, :pressed => "ems_cloud_edit" }
      expect(response.status).to eq(200)
    end
  end

  describe "#show" do
    render_views

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user, :features => "none")
      session[:settings] = {:views => {:vm_summary_cool => "summary"}}
      @ems = FactoryBot.create(:ems_amazon)
    end

    subject { get :show, :params => { :id => @ems.id } }

    context "render listnav partial" do
      subject { get :show, :params => { :id => @ems.id, :display => 'main' } }
      render_views

      it "correctly for summary page" do
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_ems_cloud")
      end

      it "correctly for timeline page" do
        get :show, :params => {:id => @ems.id, :display => 'timeline'}
        is_expected.to have_http_status 200
        is_expected.to render_template(:partial => "layouts/listnav/_ems_cloud")
      end
    end

    context "render dashboard" do
      subject { get :show, :params => { :id => @ems.id, :display => 'dashboard' } }
      render_views

      it 'never render template show' do
        is_expected.not_to render_template('shared/views/ems_common/show')
      end

      it 'uses its own template' do
        is_expected.to have_http_status 200
        is_expected.not_to render_template(:partial => "ems_cloud/show_dashboard")
      end
    end

    it 'displays only associated storage_managers' do
      FactoryBot.create(:ems_storage, :type =>  "ManageIQ::Providers::Amazon::StorageManager::Ebs", :parent_ems_id => @ems.id)
      FactoryBot.create(:ems_storage, :type =>  "ManageIQ::Providers::Amazon::StorageManager::Ebs", :parent_ems_id => @ems.id)
      get :show, :params => { :display => "storage_managers", :id => @ems.id, :format => :js }
      expect(response).to render_template('layouts/angular/_gtl')
      expect(response.status).to eq(200)
    end
  end

  describe "#dialog_form_button_pressed" do
    let(:dialog) { double("Dialog") }
    let(:wf) { double(:dialog => dialog) }

    before do
      @ems = FactoryBot.create(:ems_amazon)
      edit = {:rec_id => 1, :wf => wf, :key => 'dialog_edit__foo', :target_id => @ems.id}
      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@sb, {})
      session[:edit] = edit
    end

    it "redirects to requests show list after dialog is submitted" do
      controller.params = {:button => 'submit', :id => 'foo'}
      allow(controller).to receive(:role_allows?).and_return(true)
      allow(wf).to receive(:submit_request).and_return({})
      page = double('page')
      allow(page).to receive(:<<).with(any_args)
      expect(page).to receive(:redirect_to).with("/ems_cloud/#{@ems.id}")
      expect(controller).to receive(:render).with(:update).and_yield(page)
      controller.send(:dialog_form_button_pressed)
      expect(session[:flash_msgs]).to match [a_hash_including(:message => "Order Request was Submitted", :level => :success)]
    end
  end

  describe "Ceilometer/AMQP Events" do
    before do
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
    end

    it "creates ceilometer endpoint and on update to AMQP deletes ceilometer endpoint" do
      post :create, :params => {
        "button"                    => "add",
        "default_hostname"          => "openstack.default.example.com",
        "default_userid"            => "",
        "default_password"          => "",
        "name"                      => "openstack_cloud",
        "emstype"                   => "openstack",
        "api_version"               => "v2",
        "provider_region"           => "",
        "zone"                      => zone.name,
        "default_api_port"          => "5000",
        "default_security_protocol" => "ssl-with-validation",
        "event_stream_selection"    => "ceilometer"
      }
      ems_openstack = EmsCloud.where(:name => "openstack_cloud").first
      amqp = Endpoint.where(:role => "amqp", :resource_id => ems_openstack.id).first
      amqp_auth = Authentication.where(:authtype => "amqp", :resource_id => ems_openstack.id).first
      ceilometer = Endpoint.where(:role => "ceilometer", :resource_id => ems_openstack.id).first
      ceilometer_auth = Authentication.where(:authtype => "ceilometer", :resource_id => ems_openstack.id).first
      expect(amqp).to be_nil
      expect(amqp_auth).to be_nil
      expect(ceilometer).not_to be_nil
      expect(ceilometer_auth).to be_nil

      post :update, :params => {
        "id"                        => ems_openstack.id,
        "button"                    => "save",
        "default_hostname"          => "openstack.default.example.com",
        "default_userid"            => "",
        "default_password"          => "",
        "name"                      => "openstack_cloud",
        "emstype"                   => "openstack",
        "provider_region"           => "",
        "zone"                      => zone.name,
        "default_api_port"          => "5000",
        "default_security_protocol" => "ssl-with-validation",
        "event_stream_selection"    => "amqp",
        "amqp_hostname"             => "amqp.example.com",
        "amqp_api_port"             => "5672",
        "amqp_security_protocol"    => "ssl",
        "amqp_userid"               => "",
        "amqp_password"             => ""
      }
      amqp = Endpoint.where(:role => "amqp", :resource_id => ems_openstack.id).first
      ceilometer = Endpoint.where(:role => "ceilometer", :resource_id => ems_openstack.id).first
      expect(amqp).not_to be_nil
      expect(ceilometer).to be_nil
    end

    it "restarts event monitor worker on endpoints or credentials change" do
      post :create, :params => {
        "button"                    => "add",
        "default_hostname"          => "openstack.default.example.com",
        "default_userid"            => "",
        "default_password"          => "",
        "name"                      => "openstack_cloud",
        "emstype"                   => "openstack",
        "api_version"               => "v2",
        "provider_region"           => "",
        "zone"                      => zone.name,
        "default_api_port"          => "5000",
        "default_security_protocol" => "ssl-with-validation",
        "event_stream_selection"    => "ceilometer"
      }

      # Change from ceilometer to amqp
      ems_openstack = EmsCloud.where(:name => "openstack_cloud").first
      allow(controller).to receive(:find_record_with_rbac).and_return(ems_openstack)
      expect(ems_openstack).to receive(:stop_event_monitor_queue).once

      post :update, :params => {
        "id"                        => ems_openstack.id,
        "button"                    => "save",
        "default_hostname"          => "openstack.default.example.com",
        "default_userid"            => "",
        "default_password"          => "",
        "name"                      => "openstack_cloud",
        "emstype"                   => "openstack",
        "provider_region"           => "",
        "zone"                      => zone.name,
        "default_api_port"          => "5000",
        "default_security_protocol" => "ssl-with-validation",
        "event_stream_selection"    => "amqp",
        "amqp_hostname"             => "amqp.example.com",
        "amqp_api_port"             => "5672",
        "amqp_security_protocol"    => "ssl",
        "amqp_userid"               => "",
        "amqp_password"             => ""
      }

      # Change of all endpoints and credentials
      ems_openstack = EmsCloud.where(:name => "openstack_cloud").first
      allow(controller).to receive(:find_record_with_rbac).and_return(ems_openstack)
      # This is a bug in ems saving mechanism, there are 3 saves now, 2 for each auth and one for ems. We need to fix
      # that, then stop_event_monitor_queue should be called once
      expect(ems_openstack).to receive(:stop_event_monitor_queue).exactly(3).times

      post :update, :params => {
        "id"                        => ems_openstack.id,
        "button"                    => "save",
        "default_hostname"          => "openstack.default.changed.example.com",
        "default_userid"            => "changed",
        "default_password"          => "changed",
        "name"                      => "openstack_cloud",
        "emstype"                   => "openstack",
        "provider_region"           => "",
        "zone"                      => zone.name,
        "default_api_port"          => "5000",
        "default_security_protocol" => "ssl-with-validation",
        "event_stream_selection"    => "amqp",
        "amqp_hostname"             => "amqp.changed.example.com",
        "amqp_api_port"             => "5672",
        "amqp_security_protocol"    => "ssl",
        "amqp_userid"               => "changed",
        "amqp_password"             => "changed"
      }

      # Change from amqp to ceilometer
      ems_openstack = EmsCloud.where(:name => "openstack_cloud").first
      allow(controller).to receive(:find_record_with_rbac).and_return(ems_openstack)
      expect(ems_openstack).to receive(:stop_event_monitor_queue).once

      post :update, :params => {
        "id"                        => ems_openstack.id,
        "button"                    => "save",
        "default_hostname"          => "openstack.default.changed.example.com",
        "default_userid"            => "changed",
        "default_password"          => "changed",
        "name"                      => "openstack_cloud",
        "emstype"                   => "openstack",
        "provider_region"           => "",
        "zone"                      => zone.name,
        "default_api_port"          => "5000",
        "default_security_protocol" => "ssl-with-validation",
        "event_stream_selection"    => "ceilometer"
      }
    end
  end

  include_examples '#download_summary_pdf', :ems_amazon

  it_behaves_like "controller with custom buttons"

  describe "#sync_users" do
    let(:ems) { FactoryBot.create(:ems_openstack_with_authentication) }

    before { stub_user(:features => :all) }

    it "redirects when request is successful" do
      expect(controller).to receive(:find_record_with_rbac).and_return(ems)
      expect(ems).to receive(:sync_users_queue)
      post :sync_users, :params => {:id => ems.id, :sync => "", :admin_role => 1, :member_role => 2}
      expect(session[:flash_msgs]).to match [a_hash_including(:message => "Sync users queued.", :level => :success)]
      expect(response.body).to include("redirected")
      expect(response.body).to include("ems_cloud/#{ems.id}")
    end

    it "returns error if admin role is not selected" do
      post :sync_users, :params => {:id => ems.id, :sync => "", :member_role => 2}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("An admin role must be selected.")
    end

    it "returns error if member role is not selected" do
      post :sync_users, :params => {:id => ems.id, :sync => "", :admin_role => 1}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("A member role must be selected.")
    end

    def verify_password_and_confirm(password, verify)
      post :sync_users, :params => {:id => ems.id, :sync => "",
                                    :admin_role => 1, :member_role => 2,
                                    :password => password,
                                    :verify => verify}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Password/Confirm Password do not match")
    end

    it "password and confirm must be equal" do
      verify_password_and_confirm("apples", "oranges")
    end

    it "if password or confirm is not empty, then the other cannot be empty" do
      verify_password_and_confirm("apples", nil)
      verify_password_and_confirm(nil, "oranges")
    end
  end

  context "'Set Default' button rendering in listnav" do
    render_views

    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    it "renders 'Set Default' button when a user defined search exists" do
      FactoryBot.create(:ems_amazon)
      MiqSearch.create(:db          => 'EmsCloud',
                       :search_type => "user",
                       :description => 'abc',
                       :name        => 'abc',
                       :search_key  => session[:userid])
      get :show_list
      expect(response.status).to eq(200)
      expect(response.body).to have_selector("button[title*='Select a filter to set it as my default']", :text => "Set Default")
    end

    it "renders a welcoming page when no provider exists" do
      MiqSearch.create(:db          => 'EmsCloud',
                       :search_type => "user",
                       :description => 'abc',
                       :name        => 'abc',
                       :search_key  => session[:userid])
      get :show_list
      expect(response.status).to eq(200)
      expect(response.body).to have_link("Add a Provider")
    end

    it "does not render set default button when a user defined search does not exist" do
      get :show_list
      expect(response.status).to eq(200)
      expect(response.body).not_to have_selector("button[title*='Select a filter to set it as my default']", :text => "Set Default")
    end
  end

  nested_lists = %w(availability_zones cloud_tenants cloud_volumes security_groups instances images
     orchestration_stacks storage_managers)

  nested_lists.each do |custom_button_class|
    include_examples "relationship table screen with custom buttons", custom_button_class
  end

  it_behaves_like "relationship table screen with GTL", nested_lists, :ems_amazon

  context "hiding tenant column for non admin user" do
    before do
      Tenant.seed
      EvmSpecHelper.local_miq_server
    end

    let!(:record) { FactoryBot.create(:ems_cloud, :tenant => Tenant.root_tenant) }

    let(:report) do
      FactoryGirl.create(:miq_report,
                         :name        => 'Cloud Providers',
                         :db          => 'EmsCloud',
                         :title       => 'Cloud Providers',
                         :cols        => %w[name emstype_description],
                         :col_order   => %w[name emstype_description tenant.name],
                         :headers     => %w[Name Type Tenant],
                         :col_options => {"tenant.name" => {:display_method => :user_super_admin?}},
                         :include     => {"tenant" => {"columns" => ['name']}})
    end

    include_examples 'hiding tenant column for non admin user', :name => "Name", :emstype_description => "Type"
  end

  describe '#button' do
    context 'Check Compliance of Last Known Configuration on Instances' do
      let(:vm_instance) { FactoryBot.create(:vm_or_template) }
      let(:ems) { FactoryBot.create(:ems_openstack) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'instances')
        controller.params = {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => ems.id.to_s, :controller => 'ems_cloud'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          vm_instance.add_policy(policy)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end
end
