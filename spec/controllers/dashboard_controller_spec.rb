describe DashboardController do
  context "POST authenticate" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    let(:user_with_role) do
      FactoryBot.create(:user, :role => "random")
    end

    it "has secure headers" do
      get :index
      expect do
        if SecureHeaders.respond_to?(:header_hash_for)
          SecureHeaders.header_hash_for(@request) # secure headers 3.0
        else
          SecureHeaders.header_hash(@request) # secure headers 2.x
        end
      end.not_to raise_error
    end

    it "validates user" do
      skip_data_checks
      post :authenticate, :params => { :user_name => user_with_role.userid, :user_password => 'dummy' }
      expect_successful_login(user_with_role)
    end

    it "fails validation" do
      skip_data_checks
      post :authenticate
      expect_failed_login('Name is required')
    end

    it "requires user" do
      skip_data_checks
      post :authenticate, :params => { :user_name => 'bogus', :password => "bad" }
      expect_failed_login('username or password')
    end

    it "remembers group" do
      group1 = user_with_role.current_group
      group2 = FactoryBot.create(:miq_group)
      user_with_role.update_attributes(:miq_groups => [group1, group2])

      skip_data_checks
      post :authenticate, :params => { :user_name => user_with_role.userid, :user_password => 'dummy' }
      expect_successful_login(user_with_role)

      user_with_role.update_attributes(:current_group => group2)

      controller.instance_variable_set(:@current_user, nil) # force the controller to lookup the user record again
      get :index
      expect(controller.send(:current_group)).to eq(group1)
    end

    it "verifies group" do
      skip_data_checks
      post :authenticate, :params => { :user_name => user_with_role.userid, :user_password => 'dummy' }
      expect_successful_login(user_with_role)

      # no longer has access to this group
      group2 = FactoryBot.create(:miq_group)
      user_with_role.update_attributes(:current_group => group2, :miq_groups => [group2])

      controller.instance_variable_set(:@current_user, nil) # force the controller to lookup the user record again
      get :index
      expect(response.status).to eq(302)
    end

    it "requires group" do
      user = FactoryBot.create(:user, :current_group => nil)
      post :authenticate, :params => { :user_name => user.userid, :user_password => "dummy" }
      expect_failed_login('Group')
    end

    it "requires role" do
      user = FactoryBot.create(:user_with_group)
      post :authenticate, :params => { :user_name => user.userid, :user_password => "dummy" }
      expect_failed_login('Role')
    end

    it "allow users in with no vms" do
      skip_data_checks
      post :authenticate, :params => { :user_name => user_with_role.userid, :user_password => "dummy" }
      expect_successful_login(user_with_role)
    end

    it "redirects to a proper start page" do
      skip_data_checks('some_url')
      post :authenticate, :params => { :user_name => user_with_role.userid, :user_password => "dummy" }
      expect_successful_login(user_with_role, 'some_url')
    end
  end

  context "SAML and OIDC support" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    %i(saml oidc).each do |protocol|
      it "#{protocol.upcase} login should redirect to the protected page" do
        page = double("page")
        allow(page).to receive(:<<).with(any_args)
        expect(page).to receive(:redirect_to).with(controller.send("#{protocol}_protected_page"))
        expect(controller).to receive(:render).with(:update).and_yield(page)
        controller.send("initiate_#{protocol}_login")
      end
    end

    %i(saml oidc).each do |protocol|
      it "#{protocol.upcase} protected page should redirect to #{protocol}_logout without a valid user" do
        get "#{protocol}_login".to_sym
        expect(response).to redirect_to(:action => "logout")
      end
    end

    %i(saml oidc).each do |protocol|
      it "#{protocol.upcase} protected page should render the #{protocol}_login page with the proper validation_url and api token" do
        user           = FactoryBot.create(:user, :userid => "johndoe", :role => "test")
        auth_token     = "aabbccddeeff"
        validation_url = "/user_validation_url"

        request.env["HTTP_X_REMOTE_USER"] = user.userid
        skip_data_checks(validation_url)

        allow(User).to receive(:authenticate).and_return(user)
        allow_any_instance_of(Api::UserTokenService).to receive(:generate_token)
          .with(user.userid, "ui")
          .and_return(auth_token)

        expect(controller).to receive(:render)
          .with(:template => "dashboard/#{protocol}_login",
                :layout   => false,
                :locals   => {:api_auth_token => auth_token, :validation_url => validation_url})
          .exactly(1).times

        controller.send("#{protocol}_login")
      end
    end
  end

  # would like to test these controller by calling authenticate
  # need to ensure all cases are handled before deleting these
  context "#validate_user" do
    before do
      EvmSpecHelper.create_guid_miq_server_zone
    end

    it "returns flash message when user's group is missing" do
      user = FactoryBot.create(:user)
      allow(User).to receive(:authenticate).and_return(user)
      validation = controller.send(:validate_user, user)
      expect(validation.flash_msg).to include('User\'s Group is missing')
    end

    it "returns flash message when user's role is missing" do
      user = FactoryBot.create(:user_with_group)
      allow(User).to receive(:authenticate).and_return(user)
      validation = controller.send(:validate_user, user)
      expect(validation.flash_msg).to include('User\'s Role is missing')
    end

    it "returns flash message when user does not have access to any features" do
      user = FactoryBot.create(:user, :role => "test")
      allow(User).to receive(:authenticate).and_return(user)
      validation = controller.send(:validate_user, user)
      expect(validation.flash_msg).to include("The user's role is not authorized for any access")
    end

    it "returns url for the user with access to only Containers maintab" do
      MiqShortcut.seed
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      allow(controller).to receive(:check_privileges).and_return(true)
      EvmSpecHelper.seed_specific_product_features("container")
      feature_id = MiqProductFeature.find_all_by_identifier(["container"])
      user = FactoryBot.create(:user, :features => feature_id)
      allow(User).to receive(:authenticate).and_return(user)
      validation = controller.send(:validate_user, user)
      expect(validation.flash_msg).to be_nil
    end

    it "returns url for the user and sets user's group/role id in session" do
      user = FactoryBot.create(:user, :role => "test")
      allow(User).to receive(:authenticate).and_return(user)
      skip_data_checks('some_url')
      validation = controller.send(:validate_user, user)
      expect(controller.current_group_id).to eq(user.current_group_id)
      expect(validation.flash_msg).to be_nil
      expect(validation.url).to eq('some_url')
    end
  end

  context "Create Dashboard" do
    it "dashboard show" do
      # create dashboard for a group
      ws = FactoryBot.create(:miq_widget_set, :name     => "default",
                                               :set_data => {:last_group_db_updated => Time.now.utc,
                              :col1 => [1], :col2 => [], :col3 => []})

      ur = FactoryBot.create(:miq_user_role)
      group = FactoryBot.create(:miq_group, :miq_user_role => ur, :settings => {:dashboard_order => [ws.id]})
      user = FactoryBot.create(:user, :miq_groups => [group])

      controller.instance_variable_set(:@sb, :active_db => ws.name)
      controller.instance_variable_set(:@tabs, [])
      login_as user
      # create a user's dashboard using group dashboard name.
      FactoryBot.create(:miq_widget_set,
                         :name     => "#{user.userid}|#{group.id}|#{ws.name}",
                         :set_data => {:last_group_db_updated => Time.now.utc, :col1 => [1], :col2 => [], :col3 => []})
      controller.show
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end

    it "widget_add" do
      ur = FactoryBot.create(:miq_user_role)
      group = FactoryBot.create(:miq_group, :miq_user_role => ur)
      user = FactoryBot.create(:user, :miq_groups => [group])
      wi = FactoryBot.create(:miq_widget)
      ws = FactoryBot.create(:miq_widget_set, :name     => "default",
                                               :set_data => {:last_group_db_updated => Time.now.utc,
                                                             :col1 => [], :col2 => [], :col3 => []},
                                               :userid   => user.userid,
                                               :group_id => group.id)
      session[:sandboxes] = {"dashboard" => {:active_db  => ws.name,
                                             :dashboards => {ws.name => {:col1 => [], :col2 => [], :col3 => []}}}}
      login_as user
      allow(User).to receive(:server_timezone).and_return("UTC")
      allow(MiqServer).to receive(:my_zone).and_return('default')
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
      post :widget_add, :params => { :widget => wi.id }
      expect(controller.send(:flash_errors?)).not_to be_truthy
      post :widget_add, :params => { :widget => wi.id }
      expect(controller.send(:flash_errors?)).to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("is already part of the edited dashboard")
    end
  end

  context "#main_tab redirects to correct url when maintab is pressed by limited access user" do
    before do
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      allow(controller).to receive(:check_privileges).and_return(true)
    end

    main_tabs = {
      :clo => ["vm_cloud_explorer", 'vm_cloud/explorer'],
      :inf => ["vm_infra_explorer", 'vm_infra/explorer'],
      :svc => ["vm_explorer",       'vm_or_template/explorer'],
    }
    main_tabs.each do |tab, (feature, url)|
      it "for tab ':#{tab}'" do
        login_as FactoryBot.create(:user, :features => feature)
        session[:tab_url] = {}
        post :maintab, :params => { :tab => tab }
        expect(response.body).to include(url)
      end
    end
  end

  context "#main_tab redirects to correct url when maintab is pressed by user with only Tenant features" do
    before do
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      allow(controller).to receive(:check_privileges).and_return(true)
      EvmSpecHelper.seed_specific_product_features("rbac_tenant")
      feature_id = MiqProductFeature.find_all_by_identifier(["rbac_tenant"])
      login_as FactoryBot.create(:user, :features => feature_id)
    end

    it "for Configure maintab" do
      session[:tab_url] = {}
      post :maintab, :params => { :tab => "set" }
      expect(response.body).to include("ops/explorer")
    end
  end

  context "#start_url_for_user" do
    before do
      MiqShortcut.seed
      allow(controller).to receive(:check_privileges).and_return(true)
    end

    it "retuns start page url that user has set as startpage in settings" do
      login_as FactoryBot.create(:user, :features => "everything")
      controller.instance_variable_set(:@settings, :display => {:startpage => "/dashboard/show"})

      allow(controller).to receive(:role_allows?).and_return(true)
      url = controller.send(:start_url_for_user, nil)
      expect(url).to eq("/dashboard/show")
    end

    it "returns first url that user has access to as start page when user doesn't have access to startpage set in settings" do
      login_as FactoryBot.create(:user, :features => "vm_cloud_explorer")
      controller.instance_variable_set(:@settings, :display => {:startpage => "/dashboard/show"})
      url = controller.send(:start_url_for_user, nil)
      expect(url).to eq("/vm_cloud/explorer?accordion=instances")
    end
  end

  describe '#resize_layout' do
    before do
      controller.params[:sidebar] = sidebar
      controller.params[:context] = context
      expect(controller).to receive(:head).with(:ok)
      controller.send(:resize_layout)
    end

    context 'controller is not nil' do
      let(:context) { 'sample_controller' }

      context 'invalid sidebar value' do
        let(:sidebar) { 'not a number' }

        it 'sets width to 0 units' do
          expect(session[:sidebar][context]).to eq(0)
        end
      end

      context 'valid sidebar value' do
        let(:sidebar) { '3' }

        it 'sets width to 3 units' do
          expect(session[:sidebar][context]).to eq(3)
        end
      end

      context 'no sidebar value' do
        let(:sidebar) { nil }

        it 'does not change the configuration' do
          expect(session[:sidebar]).to be nil
        end
      end
    end

    context 'controller is nil' do
      let(:sidebar) { nil }
      let(:context) { nil }

      it 'does not change the configuration' do
        expect(session[:sidebar]).to be nil
      end
    end
  end

  context "#maintab" do
    before do
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      allow(controller).to receive(:check_privileges).and_return(true)
    end
    it "redirects a restful link correctly" do
      ems_cloud_amz = FactoryBot.create(:ems_amazon)
      breadcrumbs = [{:name => "Name", :url => "/controller/action"}]
      session[:breadcrumbs] = breadcrumbs
      session[:tab_url] = {:clo => "/ems_cloud/#{ems_cloud_amz.id}"}
      post :maintab, :params => { :tab => "clo" }
      expect(response.header['Location']).to include(ems_cloud_path(ems_cloud_amz))
      expect(controller.instance_variable_get(:@breadcrumbs)).to eq([])
    end
  end

  context "#session_reset" do
    it "verify certain keys are restored after session is cleared" do
      user_TZO           = '5'
      browser_info       = {:name => 'firefox', :version => '32'}
      session[:browser]  = browser_info
      session[:user_TZO] = user_TZO
      session[:foo]      = 'foo_bar'

      controller.send(:session_reset)

      expect(session[:browser]).to eq(browser_info)
      expect(session[:user_TZO]).to eq(user_TZO)
      expect(session[:foo]).to eq(nil)
      expect(browser_info(:version)).to eq(browser_info[:version])
    end
  end

  describe "building tabs" do
    let(:group) do
      role = FactoryBot.create(:miq_user_role)
      FactoryBot.create(:miq_group, :miq_user_role => role)
    end

    let(:user) do
      FactoryBot.create(:user, :miq_groups => [group])
    end

    let(:wset) do
      FactoryBot.create(
        :miq_widget_set,
        :name     => "Widgets",
        :userid   => user.userid,
        :group_id => group.id,
        :set_data => {
          :last_group_db_updated => Time.now.utc,
          :col1 => [1], :col2 => [], :col3 => []
        }
      )
    end

    before do
      login_as user

      controller.instance_variable_set(:@_params, :tab => wset.id)
      controller.instance_variable_set(
        :@sb,
        :active_db  => wset.name, :active_db_id => wset.id,
        :dashboards => { wset.name => {:col1 => [1], :col2 => [], :col3 => []} }
      )

      controller.show
    end

    it 'sets the active tab' do
      expect(assigns(:active_tab)).to eq(wset.id.to_s)
    end

    it 'sets available tabs' do
      expect(assigns(:tabs)).not_to be_empty
    end
  end

  describe '#dialog_definition' do
    before do
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      allow(controller).to receive(:check_privileges).and_return(true)
    end

    let(:klass) { 'someboringclass' }
    let(:name) { 'a_random_name' }

    context 'existing dialog' do
      it 'returns json with data' do
        data = 'bububububuraky'
        expect(controller).to receive(:load_dialog_definition).and_return(data)
        post :dialog_definition, :params => {:name => name, :class => klass}
        expect(response.status).to eq(200)
        expect(response.body).to include(data)
      end
    end

    context 'not existing dialog' do
      it 'does not find' do
        expect(controller).to receive(:load_dialog_definition).and_return(nil)
        post :dialog_definition, :params => {:name => name, :class => klass}
        expect(response.status).to eq(404)
      end
    end

    context 'directory traversal' do
      it 'ignores anything but [a-z_]' do
        expect(controller).to receive(:load_dialog_definition).with('abc_de', klass).and_return('data')
        post :dialog_definition, :params => {:name => '../../abc-!_de', :class => klass}
      end
    end
  end

  describe 'private #load_dialog_definition' do
    let (:klass) { 'Foobar' }
    let (:name) { 'existing_dialog' }
    let (:dialog_path) { Pathname.new("/dialogs/#{name}.json") }

    before do
      plug = double('Plugin')
      allow(plug).to receive(:name).and_return("#{klass}::Engine")
      allow(plug).to receive(:root).and_return(Pathname.new('/'))

      allow(Vmdb::Plugins).to receive(:find).and_return(plug)
    end

    context 'existing dialog' do
      it 'returns data read from the filesystem' do
        data = 'some data'
        expect(File).to receive(:'exist?').with(dialog_path).and_return(true)
        expect(File).to receive(:read).with(dialog_path).and_return(data)
        expect(controller.send(:load_dialog_definition, name, klass)).to eq(data)
      end
    end

    context 'not existing dialog' do
      it 'returns nil' do
        expect(File).to receive(:'exist?').with(dialog_path).and_return(false)
        expect(controller.send(:load_dialog_definition, name, klass)).to be_nil
      end
    end

    context 'unknown class' do
      it 'returns nil' do
        expect(controller.send(:load_dialog_definition, name, klass)).to be_nil
      end
    end
  end

  context 'skip_after_action :set_global_session_data' do
    before do
      _, _server, = EvmSpecHelper.create_guid_miq_server_zone
      session[:edit] = "xyz"
    end

    it 'retains the existing value of session[:edit] after the POST request' do
      post :csp_report, :body => '{"csp-report":{"document-uri":"https://example.com/foo/bar"}}', :format => 'json'
      expect(session[:edit]).to eq("xyz")
      expect(response.status).to eq(200)
    end
  end

  def skip_data_checks(url = '/')
    allow_any_instance_of(UserValidationService).to receive(:server_ready?).and_return(true)
    allow(controller).to receive(:start_url_for_user).and_return(url)
  end

  # logs in and redirects to home url
  def expect_successful_login(user, target_url = nil)
    expect(controller.send(:current_user)).to eq(user)
    expect(controller.send(:current_group)).to eq(user.current_group)
    expect(response.body).to match(/location.href.*#{target_url}/)
  end

  def expect_failed_login(flash = nil)
    expect(controller.send(:current_user)).to be_nil
    expect(response.body).not_to match(/location.href/)

    # TODO: figure out why flash messages are not in result.body
    expect(response.body).to match(/flash_msg_div/) if flash
    # expect(result.body.to match(/flash_msg_div.*replaceWith.*#{msg}/) if flash
  end

  def browser_info(typ)
    session.fetch_path(:browser, typ).to_s
  end
end
