describe OpsController do
  let(:user) { FactoryBot.create(:user, :role => "super_administrator") }
  before do
    EvmSpecHelper.create_guid_miq_server_zone
    MiqRegion.seed
    login_as user
  end

  describe 'x_button' do
    before do
      ApplicationController.handle_exceptions = true
    end

    describe 'corresponding methods are called for allowed actions' do
      OpsController::OPS_X_BUTTON_ALLOWED_ACTIONS.each_pair do |action_name, method|
        it "calls the appropriate method: '#{method}' for action '#{action_name}'" do
          expect(controller).to receive(method)
          get :x_button, :params => {:pressed => action_name}
        end
      end
    end

    it 'exception is raised for unknown action' do
      get :x_button, :params => {:pressed => 'random_dude', :format => :html}
      expect(response).to render_template('layouts/exception')
    end

    describe 'x_button actions' do
      it 'rbac group add' do
        allow(controller).to receive(:x_node).and_return('xx-g')
        post :x_button, :params => {:pressed => 'rbac_group_add'}
        expect(response.status).to eq(200)
      end

      context 'with using real user' do
        let(:feature) { %w(rbac_group_edit) }
        let(:user)    { FactoryBot.create(:user, :features => feature) }

        before do
          EvmSpecHelper.seed_specific_product_features(%w(rbac_group_edit))
        end

        it 'rbac group edit' do
          allow(controller).to receive(:x_node).and_return('xx-g')
          post :x_button, :params => {:pressed => 'rbac_group_edit', :id => user.current_group.id}
          expect(response.status).to eq(200)
        end
      end

      it 'rbac role add' do
        session[:sandboxes] = {"ops" => {:trees => {}}}
        allow(controller).to receive(:x_node).and_return('xx-ur')
        post :x_button, :params => {:pressed => 'rbac_role_add'}
        expect(response.status).to eq(200)
      end
    end
  end

  describe "#edit_changed?" do
    it "should set session[:changed] as false" do
      edit = {
        :new     => {:foo => 'bar'},
        :current => {:foo => 'bar'}
      }
      controller.instance_variable_set(:@edit, edit)
      controller.send(:edit_changed?)
      expect(session[:changed]).to eq(false)
    end

    it "should set session[:changed] as true" do
      edit = {
        :new     => {:foo => 'bar'},
        :current => {:foo => 'bar1'}
      }
      controller.instance_variable_set(:@edit, edit)
      controller.send(:edit_changed?)
      expect(session[:changed]).to eq(true)
    end

    it "should set session[:changed] as false when config is same" do
      edit = {
        :new     => ::Settings.to_hash,
        :current => ::Settings.to_hash
      }
      controller.instance_variable_set(:@edit, edit)
      controller.send(:edit_changed?)
      expect(session[:changed]).to eq(false)
    end

    it "should set session[:changed] as true when config is different" do
      edit = {
        :new     => {:workers => 2},
        :current => ::Settings.to_hash
      }
      controller.instance_variable_set(:@edit, edit)
      controller.send(:edit_changed?)
      expect(session[:changed]).to eq(true)
    end
  end

  it "executes action schedule_edit" do
    schedule = FactoryBot.create(:miq_schedule, :name => "test_schedule", :description => "old_schedule_desc")
    allow(controller).to receive(:get_node_info)
    allow(controller).to receive(:replace_right_cell)
    allow(controller).to receive(:render)

    post :schedule_edit, :params => {
      :id          => schedule.id,
      :button      => "save",
      :name        => "test_schedule",
      :description => "new_description",
      :action_typ  => "vm",
      :start_date  => "06/25/2015",
      :timer_typ   => "Once",
      :timer_value => ""
    }

    expect(response).to have_http_status(204)

    audit_event = AuditEvent.where(:target_id => schedule.id).first
    expect(audit_event.attributes['message']).to include("description:[old_schedule_desc] to [new_description]")
  end

  describe "#settings_update" do
    context "when the zone is changed" do
      it "updates the server's zone" do
        server = MiqServer.first

        zone = FactoryBot.create(:zone,
                                  :name        => "not the default",
                                  :description => "Not the Default Zone")

        current = Settings.to_hash.deep_merge(:server => {:zone => "default"})
        new = Settings.to_hash.deep_merge(:server => {:zone => zone.name})

        edit = {:new => new, :current => current}
        sb = {:active_tab => "settings_server", :selected_server_id => server.id}

        controller.instance_variable_set(:@edit, edit)
        controller.instance_variable_set(:@sb, sb)
        allow(controller).to receive(:settings_get_form_vars)
        allow(controller).to receive(:x_node).and_return(double("x_node").as_null_object)
        allow(controller).to receive(:settings_server_validate)
        allow(controller).to receive(:get_node_info)
        allow(controller).to receive(:replace_right_cell)

        # expect { post :settings_update, :id => "server", :button => "save" }
        expect { controller.send(:settings_update_save) }
          .to change { server.reload.zone }.to(zone)
      end
    end
  end
end

describe OpsController do
  before do
    MiqRegion.seed
    EvmSpecHelper.local_miq_server
    login_as FactoryBot.create(:user, :features => "ops_rbac")
    allow(controller).to receive(:data_for_breadcrumbs).and_return({})
  end

  describe "#explorer" do
    it "sets correct active accordion value" do
      controller.instance_variable_set(:@sb, {})
      allow(controller).to receive(:get_node_info)
      expect(controller).to receive(:render)
      controller.send(:explorer)
      expect(response.status).to eq(200)
      expect(assigns(:sb)[:active_accord]).to eq(:rbac)
    end

    it 'calls #tree_selected_model' do
      controller.instance_variable_set(:@sb, {})
      allow(controller).to receive(:render)
      expect(controller).to receive(:tree_selected_model)
      controller.send(:explorer)
    end
  end

  describe "#replace_explorer_trees" do
    before { EvmSpecHelper.local_miq_server }
    it "build trees that are passed in and met other conditions" do
      controller.instance_variable_set(:@sb, {})
      allow(controller).to receive(:x_build_dyna_tree)
      replace_trees = %i(settings diagnostics rbac vmdb)
      presenter = ExplorerPresenter.new
      expect(controller).to receive(:reload_trees_by_presenter).with(
        instance_of(ExplorerPresenter),
        array_including(
          instance_of(TreeBuilderOpsSettings),
          instance_of(TreeBuilderOpsDiagnostics),
          instance_of(TreeBuilderOpsRbac)
        )
      )
      controller.send(:replace_explorer_trees, replace_trees, presenter)
      expect(response.status).to eq(200)
    end
  end

  context "Import Tags and Import forms" do
    %w(settings_import settings_import_tags).each do |tab|
      render_views

      before do
        _guid, @miq_server, @zone = EvmSpecHelper.remote_guid_miq_server_zone
        allow(controller).to receive(:check_privileges).and_return(true)
        allow(controller).to receive(:assert_privileges).and_return(true)
        seed_session_trees('ops', :settings_tree, 'root')
        post :change_tab, :params => {:tab_id => tab, :parent_tab_id => 'settings_tags'}
      end

      it "change_tab does not update breadcrumbs" do
        expect(JSON.parse(response.body)["updatePartials"]).not_to include(:breadcrumbs)
      end

      it "Apply button remains disabled with flash errors" do
        post :explorer, :params => {:flash_error => 'true',
                                    :flash_msg   => 'Error during upload',
                                    :no_refresh  => 'true'}
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
        expect(response.body).to include("<div id='buttons_on' style='display: none;'>")
        expect(response.body).to include("<div id='buttons_off' style=''>\n<button name=\"button\" type=\"submit\" class=\"btn btn-primary disabled\">Apply</button>")
      end

      it "Apply button enabled when there are no flash errors" do
        controller.instance_variable_set(:@flash_array, [])
        post :explorer, :params => {:no_refresh => 'true'}
        expect(response.status).to eq(200)
        expect(response.body).to_not be_empty
        expect(response.body).to include("<div id='buttons_on' style=''>")
        expect(response.body).to include("<div id='buttons_off' style='display: none;'>\n<button name=\"button\" type=\"submit\" class=\"btn btn-primary disabled\">Apply</button>")
      end
    end
  end

  describe '#dialog_replace_right_cell' do
    context 'for an User' do
      before do
        user = FactoryBot.create(:user)
        allow(controller).to receive(:x_node).and_return("u-#{user.id}")
      end

      it 'calls #replace_right_cell with nodetype set to dialog_return' do
        expect(controller).to receive(:replace_right_cell).with(:nodetype => 'dialog_return')
        controller.send(:dialog_replace_right_cell)
      end
    end

    context 'for a Group' do
      let(:group) { FactoryBot.create(:miq_group) }

      before do
        allow(controller).to receive(:x_node).and_return("g-#{group.id}")
      end

      it 'calls #replace_right_cell with nodetype set to dialog_return and #rbac_group_get_details with group id' do
        expect(controller).to receive(:rbac_group_get_details).with(group.id)
        expect(controller).to receive(:replace_right_cell).with(:nodetype => 'dialog_return')
        controller.send(:dialog_replace_right_cell)
      end
    end
  end

  describe "#tree_selected_model" do
    it 'sets @tree_model_selected to User for user node' do
      allow(controller).to receive(:x_node).and_return('u-42')
      controller.tree_selected_model
      expect(assigns(:tree_selected_model)).to eq(User)
    end

    it 'sets @tree_model_selected to Tenant for tenant node' do
      allow(controller).to receive(:x_node).and_return('tn-42')
      controller.tree_selected_model
      expect(assigns(:tree_selected_model)).to eq(Tenant)
    end

    it 'sets @tree_model_selected to MiqGroup for group node' do
      allow(controller).to receive(:x_node).and_return('g-42')
      controller.tree_selected_model
      expect(assigns(:tree_selected_model)).to eq(MiqGroup)
    end

    it 'sets @tree_model_selected to MiqUserRole for group node' do
      allow(controller).to receive(:x_node).and_return('ur-42')
      controller.tree_selected_model
      expect(assigns(:tree_selected_model)).to eq(MiqUserRole)
    end

    it 'sets @tree_model_selected to User for all users node' do
      allow(controller).to receive(:x_node).and_return('xx-u')
      controller.tree_selected_model
      expect(assigns(:tree_selected_model)).to eq(User)
    end

    it 'sets @tree_model_selected to Tenant for all tenants node' do
      allow(controller).to receive(:x_node).and_return('xx-tn')
      controller.tree_selected_model
      expect(assigns(:tree_selected_model)).to eq(Tenant)
    end

    it 'sets @tree_model_selected to MiqGroup for all groups node' do
      allow(controller).to receive(:x_node).and_return('xx-g')
      controller.tree_selected_model
      expect(assigns(:tree_selected_model)).to eq(MiqGroup)
    end

    it 'sets @tree_model_selected to MiqUserRole for all roles node' do
      allow(controller).to receive(:x_node).and_return('xx-ur')
      controller.tree_selected_model
      expect(assigns(:tree_selected_model)).to eq(MiqUserRole)
    end

    it 'sets @tree_model_selected to MiqRegion for root node' do
      allow(controller).to receive(:x_node).and_return('root')
      controller.tree_selected_model
      expect(assigns(:tree_selected_model)).to eq(MiqRegion)
    end
  end

  describe '#tree_select' do
    it 'calls #tree_select_model' do
      login_as user_with_feature(%w(ops_settings))
      controller.instance_variable_set(:@sb, :active_tree => :settings_tree)
      controller.params[:id] = 'root'
      allow(controller).to receive(:set_active_tab)
      allow(controller).to receive(:get_node_info)
      allow(controller).to receive(:replace_right_cell)
      expect(controller).to receive(:tree_selected_model)
      controller.send(:tree_select)
    end
  end

  describe "#rbac_tenant_manage_quotas" do
    let(:tenant_alpha) { FactoryBot.create(:tenant, :parent => Tenant.root_tenant) }
    let(:tenant_omega) { FactoryBot.create(:tenant, :parent => tenant_alpha) }

    let(:feature) { MiqProductFeature.find_all_by_identifier(["rbac_tenant_manage_quotas_tenant_#{tenant_omega.id}"]) }
    let(:role_with_access_to_omega_rbac_tenant_manage_quota_permission) { FactoryBot.create(:miq_user_role, :miq_product_features => feature) }

    let(:group_alpha) { FactoryBot.create(:miq_group, :tenant => tenant_alpha, :miq_user_role => role_with_access_to_omega_rbac_tenant_manage_quota_permission) }
    let(:user_alpha)  { FactoryBot.create(:user, :miq_groups => [group_alpha]) }

    before do
      EvmSpecHelper.seed_specific_product_features(%w(rbac_tenant_manage_quotas))
      Tenant.seed
      User.current_user = user_alpha
    end

    it "doesn't perform any manage quota action on tenant_omega" do
      allow(controller).to receive(:rbac_tenant_manage_quotas_save_add)
      controller.params = {:id => tenant_omega.id, :button => 'add'}
      expect { controller.rbac_tenant_manage_quotas }.not_to raise_error
    end

    it "does perform any manage quota action on tenant_alpha" do
      allow(controller).to receive(:rbac_tenant_manage_quotas_save_add)
      controller.params = {:id => tenant_alpha.id, :button => 'add'}
      expect { controller.rbac_tenant_manage_quotas }.to raise_error(MiqException::RbacPrivilegeException)
    end
  end

  describe '#textual_group_list' do
    subject { controller.send(:textual_group_list) }

    it 'displays Properties in textual summary of a Tenant' do
      expect(subject).to include(array_including(:properties))
    end

    it 'displays Relationships in textual summary of a Tenant' do
      expect(subject).to include(array_including(:relationships))
    end

    it 'displays Smart Management in textual summary of a Tenant' do
      expect(subject).to include(array_including(:smart_management))
    end
  end

  context 'display methods for Tenant textual summary' do
    let(:record) { FactoryBot.create(:tenant) }

    before { controller.instance_variable_set(:@record, record) }

    describe '#display_service_templates' do
      let(:opts) do
        {
          :breadcrumb_title => _('Catalog Items and Bundles'),
          :association      => :nested_service_templates,
          :parent           => record,
          :no_checkboxes    => true
        }
      end

      it 'calls nested_list to display Catalog Items and Bundles' do
        expect(controller).to receive(:nested_list).with(ServiceTemplate, opts)
        controller.send(:display_service_templates)
      end
    end

    describe '#display_providers' do
      let(:opts) do
        {
          :breadcrumb_title => _('Providers'),
          :association      => :nested_providers,
          :parent           => record,
          :no_checkboxes    => true
        }
      end

      it 'calls nested_list to display Providers' do
        expect(controller).to receive(:nested_list).with(ExtManagementSystem, opts)
        controller.send(:display_providers)
      end
    end

    describe '#display_ae_namespaces' do
      let(:opts) do
        {
          :breadcrumb_title => _('Automate Domains'),
          :association      => :nested_ae_namespaces,
          :parent           => record,
          :no_checkboxes    => true
        }
      end

      it 'calls nested_list to display Providers' do
        expect(controller).to receive(:nested_list).with(MiqAeDomain, opts)
        controller.send(:display_ae_namespaces)
      end
    end
  end

  describe '#nested_list' do
    let(:record) { FactoryBot.create(:tenant) }
    let(:opts) do
      {
        :association      => :nested_service_templates,
        :parent           => record,
        :no_checkboxes    => true,
        :breadcrumb_title => 'Catalog Items and Bundles'
      }
    end

    before do
      controller.instance_variable_set(:@record, record)
      controller.instance_variable_set(:@breadcrumbs, [])
      allow(controller).to receive(:render_to_string).and_return('')
    end

    context 'updating breadcrumbs' do
      before { allow(controller).to receive(:render) }

      it 'calls add_to_breadcrumbs and render_to_string' do
        expect(controller).to receive(:render_to_string).with(:partial => 'layouts/gtl')
        expect(controller).to receive(:add_to_breadcrumbs).with(:title => opts[:breadcrumb_title])
        controller.send(:nested_list, ServiceTemplate, opts)
      end
    end

    it 'updates right cell text' do
      expect(controller).to receive(:render).with(:json => {:explorer       => 'replace_main_div',
                                                            :rightCellText  => "#{record.name} (All #{opts[:breadcrumb_title]})",
                                                            :setVisibility  => {:toolbar => false},
                                                            :updatePartials => {'ops_tabs' => '', :breadcrumbs => ''}})
      controller.send(:nested_list, ServiceTemplate, opts)
    end
  end
end
