describe HostController do
  let!(:user) { stub_user(:features => :all) }
  let(:host)  { FactoryGirl.create(:host) }
  let(:host2) { FactoryGirl.create(:host) }
  let(:hardware) { FactoryGirl.create(:hardware, :provision_state => "manageable") }

  describe "Shared button examples" do

  end

  describe "#button" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    # Button presses covered by shared examples:
    # host_scan
    # host_check_compliance
    # host_refresh
    # host_protect
    # host_edit
    # host_delete
    # host_cloud_service_scheduling_toggle
    # host_compare
    # host_introspect
    # host_manageable
    # host_miq_request_new
    # host_provide
    # host_toggle_maintenance
    # host_analyze_check_compliance
    # host_tag
    # vm_right_size
    # vm_migrate
    # vm_retire
    # vm_protect
    # miq_template_protect
    # vm_tag
    # miq_template_tag

    include_examples :host_vm_button_examples
    include_examples :common_host_button_examples
    include_examples :special_host_button_examples

    %w(
      common_drift
      perf_refresh
      perf_reload
      storage_refresh
      storage_scan
    ).each do |pressed|
      it "handles #{pressed}" do
        expect(controller).to receive("handle_#{pressed}".to_sym)
        post :button, :params => { :pressed => pressed, :format => :js, :id => host.id }
        expect(assigns(:flash_array)).to be_nil
      end
    end

    it "handles storage_tag" do
      expect(controller).to receive(:tag).with(Storage).and_call_original
      post :button, :params => { :pressed => "storage_tag", :format => :js }
      expect(assigns(:flash_array)).to be_nil
    end

    let(:dialog) { FactoryGirl.create(:dialog, :label => "Some Label") }
    let(:dialog_tab) { FactoryGirl.create(:dialog_tab, :label => "Some Tab", :order => 0) }
    let(:custom_button) { FactoryGirl.create(:custom_button, :applies_to_class => "Host") }
    let(:resource_action) { FactoryGirl.create(:resource_action, :dialog_id => dialog.id) }

    it "handles when Custom Button is pressed" do
      dialog.dialog_tabs << dialog_tab
      custom_button.resource_action = resource_action
      custom_button.save
      expect(controller).to receive(:handle_custom_button).and_call_original

      post :button, :params => { :pressed => "custom_button", :id => host.id, :button_id => custom_button.id }

      expect(response.status).to eq(200)
      expect(assigns(:flash_array)).to be_nil
    end
  end

  describe "#edit" do
    it "doesn't break" do
      session[:host_items] = [host.id, host2.id]
      session[:settings] = {:views     => {:host => 'grid'},
                            :display   => {:quad_truncate => 'f'},
                            :quadicons => {:host => 'foo'}}
      get :edit
      expect(response.status).to eq(200)
    end
  end

  describe "#create" do
    it "can create a host with custom id and no host name" do
      controller.instance_variable_set(:@breadcrumbs, [])


      controller.instance_variable_set(:@_params,
                                       :button   => "add",
                                       :id       => "new",
                                       :name     => 'foobar',
                                       :hostname => nil,
                                       :custom_1 => 'bar'
                                      )

      expect_any_instance_of(Host).to receive(:save).and_call_original
      expect(controller).to receive(:render)
      controller.send(:create)
      expect(response.status).to eq(200)
    end

    it "doesn't crash when trying to validate a new host" do
      controller.instance_variable_set(:@breadcrumbs, [])
      controller.new


      controller.instance_variable_set(:@_params,
                                       :button           => "validate",
                                       :type             => "default",
                                       :id               => "new",
                                       :name             => 'foobar',
                                       :hostname         => '127.0.0.1',
                                       :default_userid   => "abc",
                                       :default_password => "def",
                                       :default_verify   => "def",
                                       :user_assigned_os => "linux_generic"
                                      )
      expect(controller).to receive(:render)
      controller.send(:create)
      expect(response.status).to eq(200)
    end
  end


  describe "#set_record_vars" do

    it "strips leading/trailing whitespace from hostname/ipaddress when adding infra host" do
      controller.instance_variable_set(:@_params,
                                       :name     => 'EMS 2',

                                       :emstype  => 'rhevm',
                                       :hostname => '  10.10.10.10  '
                                      )
      host = Host.new
      controller.send(:set_record_vars, host, false)
      expect(host.hostname).to eq('10.10.10.10')
    end
  end


  describe "#show_association" do

    before(:each) do
      @host = FactoryGirl.create(:host, :name =>'hostname1')
      @guest_application = FactoryGirl.create(:guest_application, :name => "foo", :host_id => @host.id)

      @datastore = FactoryGirl.create(:storage, :name => 'storage_name')
      @datastore.parent = @host
    end

    it "renders show_details for guest applications" do
      controller.instance_variable_set(:@breadcrumbs, [])
      allow(controller).to receive(:get_view)
      get :guest_applications, :params => { :id => @host.id }
      expect(response.status).to eq(200)
      expect(response).to render_template('host/show')
      expect(assigns(:breadcrumbs)).to eq([{:name => "#{@host.name} (Packages)",
                                            :url  => "/host/guest_applications/#{@host.id}"}])
      expect(assigns(:devices)).to be_kind_of(Array)
    end

    it "shows associated datastores" do
      controller.instance_variable_set(:@breadcrumbs, [])
      get :show, :params => {:id => @host.id, :display => 'storages'}
      expect(response.status).to eq(200)
      expect(response).to render_template('host/show')
      expect(assigns(:breadcrumbs)).to eq([{:name => "#{@host.name} (All Datastores)",
                                            :url  => "/host/show/#{@host.id}?display=storages"}])
    end
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryGirl.create(:user)
      @host = FactoryGirl.create(:host,
                                 :hardware => FactoryGirl.create(:hardware,
                                                                 :cpu_sockets          => 2,
                                                                 :cpu_cores_per_socket => 4,
                                                                 :cpu_total_cores      => 8))
      session[:settings] = {:quadicons => {:host => 'foo'}}
    end

    subject { get :show, :params => {:id => @host.id} }

    context "render" do
      render_views
      it "show and listnav" do
        is_expected.to have_http_status 200
        is_expected.to render_template('host/show')
        is_expected.to render_template(:partial => "layouts/listnav/_host")
      end
    end
  end

  include_examples '#download_summary_pdf', :host

  describe "#set_credentials" do
    let(:mocked_host) { double(Host) }
    it "uses params[:default_password] for validation if one exists" do
      controller.instance_variable_set(:@_params,
                                       :default_userid   => "default_userid",
                                       :default_password => "default_password2")
      creds = {:userid => "default_userid", :password => "default_password2"}
      expect(mocked_host).to receive(:update_authentication).with({:default => creds}, {:save => false})
      expect(controller.send(:set_credentials, mocked_host, :validate)).to include(:default => creds)
    end

    it "uses the stored password for validation if params[:default_password] does not exist" do
      controller.instance_variable_set(:@_params, :default_userid => "default_userid")
      expect(mocked_host).to receive(:authentication_password).and_return('default_password')
      creds = {:userid => "default_userid", :password => "default_password"}
      expect(mocked_host).to receive(:update_authentication).with({:default => creds}, {:save => false})
      expect(controller.send(:set_credentials, mocked_host, :validate)).to include(:default => creds)
    end

    it "uses the passwords from param for validation if they exist" do
      controller.instance_variable_set(:@_params,
                                       :default_userid   => "default_userid",
                                       :default_password => "default_password2",
                                       :remote_userid    => "remote_userid",
                                       :remote_password  => "remote_password2")
      default_creds = {:userid => "default_userid", :password => "default_password2"}
      remote_creds = {:userid => "remote_userid", :password => "remote_password2"}
      expect(mocked_host).to receive(:update_authentication).with({:default => default_creds,
                                                                   :remote  => remote_creds}, {:save => false})

      expect(controller.send(:set_credentials, mocked_host, :validate)).to include(:default => default_creds,
                                                                                   :remote  => remote_creds)
    end

    it "uses the stored passwords for validation if passwords dont exist in params" do
      controller.instance_variable_set(:@_params,
                                       :default_userid => "default_userid",
                                       :remote_userid  => "remote_userid",)
      expect(mocked_host).to receive(:authentication_password).and_return('default_password')
      expect(mocked_host).to receive(:authentication_password).with(:remote).and_return('remote_password')
      default_creds = {:userid => "default_userid", :password => "default_password"}
      remote_creds = {:userid => "remote_userid", :password => "remote_password"}
      expect(mocked_host).to receive(:update_authentication).with({:default => default_creds,
                                                                   :remote  => remote_creds}, {:save => false})

      expect(controller.send(:set_credentials, mocked_host, :validate)).to include(:default => default_creds,
                                                                                   :remote  => remote_creds)
    end

    it "uses the stored passwords/passwords from params to do validation" do
      controller.instance_variable_set(:@_params,
                                       :default_userid   => "default_userid",
                                       :default_password => "default_password2",
                                       :ws_userid        => "ws_userid",
                                       :ipmi_userid      => "ipmi_userid")
      expect(mocked_host).to receive(:authentication_password).with(:ws).and_return('ws_password')
      expect(mocked_host).to receive(:authentication_password).with(:ipmi).and_return('ipmi_password')
      default_creds = {:userid => "default_userid", :password => "default_password2"}
      ws_creds = {:userid => "ws_userid", :password => "ws_password"}
      ipmi_creds = {:userid => "ipmi_userid", :password => "ipmi_password"}
      expect(mocked_host).to receive(:update_authentication).with({:default => default_creds,
                                                                   :ws      => ws_creds,
                                                                   :ipmi    => ipmi_creds}, {:save => false})

      expect(controller.send(:set_credentials, mocked_host, :validate)).to include(:default => default_creds,
                                                                                   :ws      => ws_creds,
                                                                                   :ipmi    => ipmi_creds)
    end
  end

  describe "#render pages" do

    render_views

    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    it "renders a new page with ng-required condition set to false for password" do
      get :new
      expect(response.status).to eq(200)
      expect(response.body).to include("name='default_password' ng-disabled='!vm.showVerify(&#39;default_userid&#39;)' ng-model='$parent.hostModel.default_password' ng-required='false'")
    end
  end

  it_behaves_like "controller with custom buttons"
end
