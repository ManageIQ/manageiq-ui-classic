describe HostController do
  let(:h1) { FactoryBot.create(:host, :name => 'foobar') }
  let(:h2) { FactoryBot.create(:host, :name => 'bar') }

  describe "#button" do
    render_views

    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone

      ApplicationController.handle_exceptions = true
    end

    it "renders index" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
    end

    it "renders show_list and does not include hidden column" do
      allow(controller).to receive(:render)
      report = FactoryBot.create(:miq_report,
                                  :name        => 'Hosts',
                                  :title       => 'Hosts',
                                  :cols        => %w(name ipaddress v_total_vms),
                                  :col_order   => %w(name ipaddress v_total_vms),
                                  :headers     => %w(Name IP\ Address VMs),
                                  :col_options => {"name" => {:hidden => true}})
      expect(controller).to receive(:get_db_view).and_return(report)
      controller.send(:report_data)
      view_hash = controller.send(:view_to_hash, assigns(:view))
      expect(view_hash[:head]).not_to include(:text => "Name", :sort => "str", :col_idx => 0, :align => "left")
      expect(view_hash[:head]).to include(:text => "IP Address", :sort => "str", :col_idx => 1, :align => "left")
    end

    it "renders show_list and includes all columns" do
      allow(controller).to receive(:render)
      report = FactoryBot.create(:miq_report,
                                  :name      => 'Hosts',
                                  :title     => 'Hosts',
                                  :cols      => %w(name ipaddress v_total_vms),
                                  :col_order => %w(name ipaddress v_total_vms),
                                  :headers   => %w(Name IP\ Address VMs))
      expect(controller).to receive(:get_db_view).and_return(report)
      controller.send(:report_data)
      view_hash = controller.send(:view_to_hash, assigns(:view))
      expect(view_hash[:head]).to include(:text => "Name", :sort => "str", :col_idx => 0, :align => "left")
      expect(view_hash[:head]).to include(:text => "IP Address", :sort => "str", :col_idx => 1, :align => "left")
    end

    it 'edit renders GTL grid with selected Host records' do
      session[:host_items] = [h1.id, h2.id]
      session[:settings] = {:views     => {:host => 'grid'},
                            :display   => {:quad_truncate => 'f'},
                            :quadicons => {:host => 'foo'}}

      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name       => 'Host',
        :gtl_type_string  => 'grid',
        :parent_id        => nil,
        :selected_records => [h1.id, h2.id]
      )
      get :edit
      expect(response.status).to eq(200)
    end

    it "when VM Right Size Recommendations is pressed" do
      expect(controller).to receive(:vm_right_size)
      post :button, :params => {:pressed => 'vm_right_size', :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Migrate is pressed" do
      expect(controller).to receive(:prov_redirect).with("migrate")
      post :button, :params => {:pressed => 'vm_migrate', :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Retire is pressed" do
      expect(controller).to receive(:retirevms).once
      post :button, :params => {:pressed => 'vm_retire', :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Manage Policies is pressed" do
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      post :button, :params => {:pressed => 'vm_protect', :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Manage Policies is pressed" do
      expect(controller).to receive(:assign_policies).with(VmOrTemplate)
      post :button, :params => {:pressed => 'miq_template_protect', :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when VM Tag is pressed" do
      expect(controller).to receive(:tag).with(VmOrTemplate)
      post :button, :params => {:pressed => 'vm_tag', :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when MiqTemplate Tag is pressed" do
      expect(controller).to receive(:tag).with(VmOrTemplate)
      post :button, :params => {:pressed => 'miq_template_tag', :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Custom Button is pressed" do
      host = FactoryBot.create(:host)
      custom_button = FactoryBot.create(:custom_button, :applies_to_class => "Host")
      d = FactoryBot.create(:dialog, :label => "Some Label")
      dt = FactoryBot.create(:dialog_tab, :label => "Some Tab", :order => 0)
      d.dialog_tabs << dt
      ra = FactoryBot.create(:resource_action, :dialog_id => d.id)
      custom_button.resource_action = ra
      custom_button.save
      post :button, :params => {:pressed => "custom_button", :id => host.id, :button_id => custom_button.id}
      expect(response.status).to eq(200)
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "when Drift button is pressed" do
      expect(controller).to receive(:drift_analysis)
      post :button, :params => {:pressed => 'common_drift', :format => :js}
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    context 'provisioning VMS displayed through details page of a Host' do
      before do
        allow(controller).to receive(:process_vm_buttons)
        allow(controller).to receive(:performed?).and_return(false)
        allow(request).to receive(:parameters).and_return(:pressed => 'vm_miq_request_new')
        controller.instance_variable_set(:@display, 'vms')
        controller.instance_variable_set(:@lastaction, 'show')
        controller.params = {:pressed => 'vm_miq_request_new'}
      end

      it 'calls render_or_redirect_partial method' do
        controller.send(:prov_redirect)
        expect(controller).to receive(:render_or_redirect_partial).with('vm')
        controller.send(:button)
      end
    end
  end

  describe "#create" do
    it "can create a host with custom id and no host name" do
      stub_user(:features => :all)
      controller.instance_variable_set(:@breadcrumbs, [])

      controller.instance_variable_set(
        :@_params,
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
      stub_user(:features => :all)
      controller.instance_variable_set(:@breadcrumbs, [])
      controller.new

      controller.instance_variable_set(
        :@_params,
        :button           => "validate",
        :type             => "default",
        :id               => "new",
        :name             => 'foobar',
        :hostname         => '127.0.0.1',
        :default_userid   => "abc",
        :default_password => "def",
        :user_assigned_os => "linux_generic"
      )
      expect(controller).to receive(:render)
      controller.send(:create)
      expect(response.status).to eq(200)
    end

    context 'Check Compliance of Last Known Configuration on VMs' do
      let(:vm) { FactoryBot.create(:vm_vmware) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:drop_breadcrumb)
        allow(controller).to receive(:performed?)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'vms')
        controller.params = {:miq_grid_checks => vm.id.to_s, :pressed => 'vm_check_compliance', :id => h1.id.to_s, :controller => 'host'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          vm.add_policy(policy)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end

  describe "#set_record_vars" do
    it "strips leading/trailing whitespace from hostname/ipaddress when adding infra host" do
      stub_user(:features => :all)
      controller.instance_variable_set(
        :@_params,
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
    before do
      stub_user(:features => :all)
      @host = FactoryBot.create(:host, :name =>'hostname1')
      @guest_application = FactoryBot.create(:guest_application, :name => "foo", :host_id => @host.id)
      @datastore = FactoryBot.create(:storage, :name => 'storage_name')
      @datastore.parent = @host
    end

    it "renders show_details for guest applications" do
      controller.instance_variable_set(:@breadcrumbs, [])
      allow(controller).to receive(:get_view)
      get :guest_applications, :params => {:id => @host.id}
      expect(response.status).to eq(200)
      expect(response).to render_template('host/show')
      expect(assigns(:breadcrumbs)).to eq([{:name => "#{@host.name} (Packages)",
                                            :url  => "/host/guest_applications/#{@host.id}"}])
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

  context 'nested lists' do # these are similar to #show_association but require 'render_views'
    render_views

    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone

      @host = FactoryBot.create(:host, :name =>'hostname1')
    end

    # http://localhost:3000/host/users/10000000000005?db=host
    it "renders a grid of associated Users" do
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name      => 'Account',
        :parent_id       => @host.id.to_s,
        :parent          => @host,
        :gtl_type_string => 'list'
      )
      get :users, :params => {:id => @host.id, :db => 'host'}
      expect(response.status).to eq(200)
    end

    # http://localhost:3000/host/guest_applications/10000000000005?db=host
    it "renders a grid of associated GuestApplications" do
      @guest_application = FactoryBot.create(:guest_application, :name => "foo", :host_id => @host.id)
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name      => 'GuestApplication',
        :parent_id       => @host.id.to_s,
        :parent          => @host,
        :gtl_type_string => 'list'
      )
      get :guest_applications, :params => {:id => @host.id, :db => 'host'}
      expect(response.status).to eq(200)
    end

    # http://localhost:3000/host/filesystems/10000000000005?db=host
    it "renders a grid of all associated Filesystems" do
      @host_service_group = FactoryBot.create(:host_service_group, :name => "host_service_group1", :host_id => @host.id)
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name                     => 'Filesystem',
        :parent_id                      => @host.id.to_s,
        :parent                         => @host,
        :gtl_type_string                => 'list',
        :report_data_additional_options => {
          :named_scope => [[:host_service_group_filesystems, @host_service_group.id]]
        }
      )
      get :filesystems, :params => {:id => @host.id, :db => 'host', :host_service_group => @host_service_group.id}
      expect(response.status).to eq(200)
    end

    # http://localhost:3000/host/guest_applications/10000000000005?db=host?status=all
    it "renders a grid of all associated SystemServices" do
      @host_service_group = FactoryBot.create(:host_service_group, :name => "host_service_group1", :host_id => @host.id)
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name                     => 'SystemService',
        :parent_id                      => @host.id.to_s,
        :parent                         => @host,
        :gtl_type_string                => 'list',
        :report_data_additional_options => {
          :named_scope => [[:host_service_group_systemd, @host_service_group.id]]
        }
      )
      get :host_services, :params => {:id => @host.id, :db => 'host', :host_service_group => @host_service_group.id, :status => "all"}
      expect(response.status).to eq(200)
    end

    # http://localhost:3000/host/guest_applications/10000000000005?db=host?status=running
    it "renders a grid of running associated SystemServices" do
      @host_service_group = FactoryBot.create(:host_service_group, :name => "host_service_group1", :host_id => @host.id)
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name                     => 'SystemService',
        :parent_id                      => @host.id.to_s,
        :parent                         => @host,
        :gtl_type_string                => 'list',
        :report_data_additional_options => {
          :named_scope => [[:host_service_group_running_systemd, @host_service_group.id]]
        }
      )
      get :host_services, :params => {:id => @host.id, :db => 'host', :host_service_group => @host_service_group.id, :status => 'running'}
      expect(response.status).to eq(200)
    end

    # http://localhost:3000/host/guest_applications/10000000000005?db=host?status=failed
    it "renders a grid of failed associated SystemServices" do
      @host_service_group = FactoryBot.create(:host_service_group, :name => "host_service_group1", :host_id => @host.id)
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name                     => 'SystemService',
        :parent_id                      => @host.id.to_s,
        :parent                         => @host,
        :gtl_type_string                => 'list',
        :report_data_additional_options => {
          :named_scope => [[:host_service_group_failed_systemd, @host_service_group.id]]
        }
      )
      get :host_services, :params => {:id => @host.id, :db => 'host', :host_service_group => @host_service_group.id, :status => 'failed'}
      expect(response.status).to eq(200)
    end
  end

  describe "#show" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user, :features => "none")
      @host = FactoryBot.create(:host,
                                 :hardware => FactoryBot.create(:hardware,
                                                                 :cpu_sockets          => 2,
                                                                 :cpu_cores_per_socket => 4,
                                                                 :cpu_total_cores      => 8))
      session[:settings] = {:quadicons => {:host => 'foo'}}
    end

    subject { get :show, :params => {:id => @host.id} }

    context "render" do
      render_views

      it "show and listnav correctly for summary page" do
        is_expected.to have_http_status 200
        is_expected.to render_template('host/show')
        is_expected.to render_template(:partial => "layouts/listnav/_host")
      end

      it "show and listnav correctly for timeline page" do
        get :show, :params => {:id => @host.id, :display => 'timeline'}
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "layouts/listnav/_host")
      end
    end
  end

  include_examples '#download_summary_pdf', :host

  describe "#set_credentials" do
    let(:mocked_host) { double(Host) }

    it "uses params[:default_password] for validation if one exists" do
      controller.params = {:default_userid   => "default_userid",
                           :default_password => "default_password2"}
      creds = {:userid => "default_userid", :password => "default_password2"}
      expect(mocked_host).to receive(:update_authentication).with({:default => creds}, {:save => false})
      expect(controller.send(:set_credentials, mocked_host, :validate)).to include(:default => creds)
    end

    it "uses the stored password for validation if params[:default_password] does not exist" do
      controller.params = {:default_userid => "default_userid"}
      expect(mocked_host).to receive(:authentication_password).and_return('default_password')
      creds = {:userid => "default_userid", :password => "default_password"}
      expect(mocked_host).to receive(:update_authentication).with({:default => creds}, {:save => false})
      expect(controller.send(:set_credentials, mocked_host, :validate)).to include(:default => creds)
    end

    it "uses the passwords from param for validation if they exist" do
      controller.params = {:default_userid   => "default_userid",
                           :default_password => "default_password2",
                           :remote_userid    => "remote_userid",
                           :remote_password  => "remote_password2"}
      default_creds = {:userid => "default_userid", :password => "default_password2"}
      remote_creds = {:userid => "remote_userid", :password => "remote_password2"}
      expect(mocked_host).to receive(:update_authentication).with({:default => default_creds,
                                                                   :remote  => remote_creds}, {:save => false})

      expect(controller.send(:set_credentials, mocked_host, :validate)).to include(:default => default_creds,
                                                                                   :remote  => remote_creds)
    end

    it "uses the stored passwords for validation if passwords dont exist in params" do
      controller.params = {:default_userid => "default_userid",
                           :remote_userid  => "remote_userid"}
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
      controller.params = {:default_userid   => "default_userid",
                           :default_password => "default_password2",
                           :ws_userid        => "ws_userid",
                           :ipmi_userid      => "ipmi_userid"}
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
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end
    it "renders a new page with ng-required condition set to false for password" do
      get :new
      expect(response.status).to eq(200)
      expect(response.body).to include("name='default_password' ng-disabled='!vm.showVerify(&#39;default_userid&#39;)' ng-model='$parent.hostModel.default_password' ng-required='false'")
    end
  end

  # http://localhost:3000/host/show_list?bc=Hosts%20on%202017-09-29&escape=false&menu_click=eyJyb3ciOjAsImNvbHVtbiI6NSwiY2hhcnRfaW5kZXgiOiI2IiwiY2hhcnRfbmFtZSI6IkRpc3BsYXktSG9zdHMtb24ifQ%3D%3D&sb_controller=storage
  describe "#show_list" do
    render_views

    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    context 'called as chart click-through' do
      it 'renders GTL according to menu_click options' do
        report = double(:report)
        allow(report).to receive_message_chain(:table, :data) { [{"assoc_ids" => {:hosts => {:on => 1}}}] }
        session.store_path(:sandboxes, 'storage', :chart_reports, [report])

        menu_click = Base64.encode64(
          {:row => 0, :column => 0, :chart_index => 0, :chart_name => "Display-Hosts-on"}.to_json
        )

        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'Host',
          :report_data_additional_options => {
            :menu_click    => menu_click,
            :sb_controller => 'storage',
          }
        )

        # FIXME: This should rather be a POST, but it really is a GET.
        get :show_list, :params => {:menu_click => menu_click, :sb_controller => 'storage'}
        expect(response.status).to eq(200)
      end
    end

    context 'called with search text' do
      it 'render GTL with and saves search_text in the session' do
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'Host',
          :parent_id                      => nil,
          :report_data_additional_options => {
            :lastaction => 'show_list',
          },
        )
        get :show_list, :params => {'search[text]' => 'foobar'}
        expect(session.fetch_path(:sandboxes, 'host', :search_text)).to eq('foobar')
        expect(response.status).to eq(200)
      end
    end
  end

  describe '#report_data' do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    context 'called with search text' do
      it 'returns hosts filtered by the search text' do
        h1
        h2

        session[:sandboxes] = {}
        session.store_path(:sandboxes, 'host', :search_text, 'foobar')
        report_data_request(
          :model      => 'Host',
          :parent_id  => nil,
          :explorer   => false,
          :lastaction => 'show_list',
        )
        results = assert_report_data_response
        expect(results['data']['rows'].length).to eq(1)
        expect(results['data']['rows'][0]['long_id']).to eq(h1.id.to_s)
      end
    end
  end

  it_behaves_like "controller with custom buttons"
end
