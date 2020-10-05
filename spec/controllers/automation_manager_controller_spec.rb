describe AutomationManagerController do
  render_views

  let(:zone) { EvmSpecHelper.local_miq_server.zone }
  let(:tags) { ["/managed/quota_max_memory/2048"] }
  let(:automation_provider1) { FactoryBot.create(:provider_ansible_tower, :zone => zone) }
  let(:automation_provider2) { FactoryBot.create(:provider_ansible_tower, :zone => zone) }
  let(:automation_provider3) { FactoryBot.create(:provider_ansible_tower, :zone => zone) }

  before do
    allow(controller).to receive(:data_for_breadcrumbs).and_return({})
    Tag.find_or_create_by(:name => tags.first)
    @automation_manager1 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider1.id)
    @automation_manager2 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider2.id)
    @automation_manager3 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider3.id)

    @inventory_group = ManageIQ::Providers::AutomationManager::InventoryRootGroup.create(:ems_id => @automation_manager1.id)
    @inventory_group2 = ManageIQ::Providers::AutomationManager::InventoryRootGroup.create(:ems_id => @automation_manager2.id)
    @ans_configured_system = ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem.create(:hostname                => "ans_test_configured_system",
                                                                                                           :inventory_root_group_id => @inventory_group.id,
                                                                                                           :manager_id              => @automation_manager1.id)

    @ans_configured_system2a = ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem.create(:hostname                => "test2a_ans_configured_system",
                                                                                                             :inventory_root_group_id => @inventory_group.id,
                                                                                                             :manager_id              => @automation_manager1.id)
    @ans_configured_system2b = ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem.create(:hostname                => "test2b_ans_configured_system",
                                                                                                             :inventory_root_group_id => @inventory_group2.id,
                                                                                                             :manager_id              => @automation_manager2.id)
    controller.instance_variable_set(:@sb, :active_tree => :automation_manager_providers_tree)

    [@ans_configured_system, @ans_configured_system2a, @ans_configured_system2b].each do |cs|
      cs.tag_with(tags, :namespace => '')
    end

    @ans_job_template1 = FactoryBot.create(:ansible_configuration_script, :manager_id => @automation_manager1.id)
    @ans_job_template2 = FactoryBot.create(:ansible_configuration_script, :manager_id => @automation_manager2.id)
    @ans_job_template3 = FactoryBot.create(:ansible_configuration_script, :manager_id => @automation_manager1.id)
  end

  it "renders index" do
    stub_user(:features => :all)
    get :index
    expect(response.status).to eq(302)
    expect(response).to redirect_to(:action => 'explorer')
  end

  it "renders explorer" do
    login_as user_with_feature(%w(automation_manager_providers automation_manager_configured_system automation_manager_configuration_scripts_accord))

    get :explorer
    accords = controller.instance_variable_get(:@accords)
    expect(accords.size).to eq(3)
    breadcrumbs = controller.instance_variable_get(:@breadcrumbs)
    expect(breadcrumbs[0]).to include(:url => '/automation_manager/show_list')
    expect(response.status).to eq(200)
    expect(response.body).to_not be_empty
  end

  it "renders explorer sorted by url" do
    login_as user_with_feature(%w(automation_manager_providers automation_manager_configured_system automation_manager_configuration_scripts_accord))
    FactoryBot.create(:provider_ansible_tower, :zone => zone)
    FactoryBot.create(:provider_ansible_tower, :zone => zone)

    get :explorer, :params => {:sortby => '2'}
    expect(response.status).to eq(200)
    expect(response.body).to include('"modelName":"ManageIQ::Providers::AnsibleTower::AutomationManager"')
    expect(response.body).to include('"activeTree":"automation_manager_providers_tree"')
    expect(response.body).to include('"isExplorer":true')
    expect(response.body).to include('"showUrl":"/automation_manager/x_show/"')
  end

  context "renders the explorer based on RBAC" do
    it "renders explorer based on RBAC access to feature 'automation_manager_configured_system_tag'" do
      login_as user_with_feature %w(automation_manager_configured_system_tag)

      get :explorer
      accords = controller.instance_variable_get(:@accords)
      expect(accords.size).to eq(1)
      expect(accords[0][:name]).to eq("automation_manager_cs_filter")
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end

    it "renders explorer based on RBAC access to feature 'automation_manager_add_provider'" do
      login_as user_with_feature %w(automation_manager_add_provider)

      get :explorer
      accords = controller.instance_variable_get(:@accords)
      expect(accords.size).to eq(1)
      expect(accords[0][:name]).to eq("automation_manager_providers")
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end
  end

  context "asserts correct privileges" do
    before { login_as user_with_feature %w[automation_manager_provider_tag] }

    it "should raise an error for feature that user has no access to" do
      expect { controller.send(:assert_privileges, "automation_manager_add_provider") }
        .to raise_error(MiqException::RbacPrivilegeException)
    end
  end

  it "renders show_list" do
    stub_user(:features => :all)
    get :show_list
    expect(response.status).to eq(302)
    expect(response.body).to_not be_empty
  end

  it "renders a new page" do
    post :new, :format => :js
    expect(response.status).to eq(200)
  end

  it "#automation_manager_save_provider save does not accept a duplicate name" do
    ManageIQ::Providers::AnsibleTower::Provider.create(:name => "test2Ansible", :url => "server1", :zone => zone)
    provider2 = ManageIQ::Providers::AnsibleTower::Provider.new(:name => "test2Ansible", :url => "server2", :zone => zone)
    controller.instance_variable_set(:@provider, provider2)
    allow(controller).to receive(:render_flash)
    controller.save_provider
    expect(assigns(:flash_array).first[:message]).to include("has already been taken")
  end

  describe "#edit" do
    before { stub_user(:features => :all) }

    it "renders the edit page when the manager id is supplied" do
      post :edit, :params => { :id => @automation_manager1.id }
      expect(response.status).to eq(200)
      right_cell_text = controller.instance_variable_get(:@right_cell_text)
      expect(right_cell_text).to eq("Edit Provider")
    end

    it "should save the zone field" do
      new_zone = FactoryBot.create(:zone)
      controller.instance_variable_set(:@provider, automation_provider1)
      allow(controller).to receive(:leaf_record).and_return(false)
      post :edit, :params => { :button     => 'save',
                               :id         => @automation_manager1.id,
                               :zone       => new_zone.name,
                               :name       => 'foobar',
                               :url        => automation_provider1.url,
                               :verify_ssl => automation_provider1.verify_ssl }
      expect(response.status).to eq(200)
      expect(automation_provider1.zone).to eq(new_zone)
    end

    it "renders the edit page when the manager id is selected from a list view" do
      post :edit, :params => { :miq_grid_checks => @automation_manager1.id }
      expect(response.status).to eq(200)
    end

    it "renders the edit page when the ansible tower manager id is selected from a grid/tile" do
      post :edit, :params => { "check_#{@automation_manager1.id}" => "1" }
      expect(response.status).to eq(200)
    end
  end

  describe "#refresh" do
    before do
      stub_user(:features => :all)
      allow(controller).to receive(:x_node).and_return("root")
      allow(controller).to receive(:rebuild_toolbars).and_return("true")
    end

    it "renders the refresh flash message for Ansible Tower" do
      post :refresh, :params => {:miq_grid_checks => @automation_manager1.id}
      expect(response.status).to eq(200)
      expect(assigns(:flash_array).first[:message]).to include("Refresh Provider initiated for 1 provider")
    end

    it "refreshes the provider when the manager id is supplied" do
      allow(controller).to receive(:replace_right_cell)
      post :refresh, :params => { :id => @automation_manager1.id }
      expect(assigns(:flash_array).first[:message]).to include("Refresh Provider initiated for 1 provider")
    end

    it "it refreshes a provider when the manager id is selected from a grid/tile" do
      allow(controller).to receive(:replace_right_cell)
      post :refresh, :params => { "check_#{@automation_manager1.id}" => "1",
                                  "check_#{@automation_manager2.id}" => "1" }
      expect(assigns(:flash_array).first[:message]).to include("Refresh Provider initiated for 2 providers")
    end
  end

  context "renders right cell text" do
    before do
      right_cell_text = nil
      login_as user_with_feature(%w(automation_manager_providers automation_manager_configured_system automation_manager_configuration_scripts_accord))
      controller.instance_variable_set(:@right_cell_text, right_cell_text)
      allow(controller).to receive(:get_view_pages)
      allow(controller).to receive(:build_listnav_search_list)
      allow(controller).to receive(:load_or_clear_adv_search)
      allow(controller).to receive(:replace_search_box)
      allow(controller).to receive(:update_partials)
      allow(controller).to receive(:render)

      allow(controller).to receive(:items_per_page).and_return(20)
      allow(controller).to receive(:current_page).and_return(1)
      controller.send(:build_accordions_and_trees)
    end

    it "renders right cell text for root node" do
      controller.send(:get_node_info, "root")
      right_cell_text = controller.instance_variable_get(:@right_cell_text)
      expect(right_cell_text).to eq("All Ansible Tower Providers")
    end

    context 'searching text' do
      let(:search) { "some_text" }

      before { controller.instance_variable_set(:@search_text, search) }

      it 'updates right cell text according to search text' do
        controller.send(:get_node_info, "root")
        expect(controller.instance_variable_get(:@right_cell_text)).to eq("All Ansible Tower Providers (Names with \"#{search}\")")
      end
    end
  end

  it "builds ansible tower child tree" do
    automation_manager1 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider1.id)
    automation_manager2 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider2.id)
    automation_manager3 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider3.id)
    user = login_as user_with_feature(%w(automation_manager_providers providers_accord automation_manager_configured_system automation_manager_configuration_scripts_accord))
    TreeBuilderAutomationManagerProviders.new(:automation_manager_providers_tree, controller.instance_variable_get(:@sb))
    tree_builder = TreeBuilderAutomationManagerProviders.new("root", {})
    objects = tree_builder.send(:x_get_tree_roots)
    expected_objects = [automation_manager1, automation_manager2, automation_manager3]
    expect(objects).to match_array(expected_objects)
  end

  it "constructs the ansible tower inventory tree node" do
    TreeBuilderAutomationManagerProviders.new(:automation_manager_providers_tree, controller.instance_variable_get(:@sb))
    tree_builder = TreeBuilderAutomationManagerProviders.new("root", {})
    objects = tree_builder.send(:x_get_tree_objects, @inventory_group, false, nil)
    expected_objects = [@ans_configured_system, @ans_configured_system2a]
    expect(objects).to match_array(expected_objects)
  end

  it "builds ansible tower job templates tree" do
    user = login_as user_with_feature(%w(automation_manager_providers providers_accord automation_manager_configured_system automation_manager_configuration_scripts_accord))
    TreeBuilderAutomationManagerConfigurationScripts.new(:configuration_scripts_tree, controller.instance_variable_get(:@sb))
    tree_builder = TreeBuilderAutomationManagerConfigurationScripts.new("root", {})
    objects = tree_builder.send(:x_get_tree_roots)
    expect(objects).to include(@automation_manager1)
    expect(objects).to include(@automation_manager2)
  end

  it "constructs the ansible tower job templates tree node" do
    user = login_as user_with_feature(%w(providers_accord automation_manager_configured_system automation_manager_configuration_scripts_accord))
    TreeBuilderAutomationManagerConfigurationScripts.new(:configuration_scripts_tree, controller.instance_variable_get(:@sb))
    tree_builder = TreeBuilderAutomationManagerConfigurationScripts.new("root", {})
    objects = tree_builder.send(:x_get_tree_cmat_kids, @automation_manager1, false)
    expect(objects).to include(@ans_job_template1)
    expect(objects).to include(@ans_job_template3)
  end

  context "renders tree_select" do
    before do
      get :explorer
      right_cell_text = nil
      login_as user_with_feature(%w(automation_manager_providers automation_manager_configured_system automation_manager_configuration_scripts_accord))
      controller.instance_variable_set(:@right_cell_text, right_cell_text)
      allow(controller).to receive(:get_view_pages)
      allow(controller).to receive(:build_listnav_search_list)
      allow(controller).to receive(:load_or_clear_adv_search)
      allow(controller).to receive(:replace_search_box)
      allow(controller).to receive(:update_partials)
      allow(controller).to receive(:render)

      allow(controller).to receive(:items_per_page).and_return(20)
      allow(controller).to receive(:current_page).and_return(1)
      controller.send(:build_accordions_and_trees)
    end

    it "renders tree_select for ansible tower job templates tree node" do
      allow(controller).to receive(:x_active_tree).and_return(:configuration_scripts_tree)
      controller.instance_variable_set(:@in_report_data, true)
      controller.params = {:id => "configuration_scripts"}
      controller.send(:accordion_select)
      controller.params = {:id => "at-#{@automation_manager1.id}"}
      controller.send(:tree_select)
      # view = controller.instance_variable_get(:@view)
      show_adv_search = controller.instance_variable_get(:@show_adv_search)
      expect(show_adv_search).to eq(true)
      # expect(view.table.data.size).to eq(2)
      expect(show_adv_search).to eq(true)

      # expect(view.table.data[0].name).to eq("ConfigScript1")
      # expect(view.table.data[1].name).to eq("ConfigScript3")
    end

    it 'renders tree_select for one job template' do
      record = FactoryBot.create(:ansible_configuration_script,
                                  :name        => "ConfigScriptTest1",
                                  :survey_spec => {'spec' => [{'index' => 0, 'question_description' => 'Survey',
                                                               'type' => 'text'}]})
      stub_user(:features => :all)
      allow(controller).to receive(:x_active_tree).and_return(:configuration_scripts_tree)
      allow(controller).to receive(:x_active_accord).and_return(:configuration_scripts)
      controller.params = {:id => "cf-#{record.id}"}
      controller.send(:tree_select)
      show_adv_search = controller.instance_variable_get(:@show_adv_search)
      title = controller.instance_variable_get(:@right_cell_text)
      expect(show_adv_search).to eq(false)
      expect(title).to eq('Job Template (Ansible Tower) "ConfigScriptTest1"')
    end

    it "calls get_view with the associated dbname for the Ansible Tower Providers accordion" do
      stub_user(:features => :all)
      allow(controller).to receive(:x_active_tree).and_return(:automation_manager_providers_tree)
      allow(controller).to receive(:x_active_accord).and_return(:automation_manager_providers)
      allow(controller).to receive(:build_listnav_search_list)
      controller.params = {:id => "automation_manager_providers"}
      expect(controller).to receive(:get_view).with("ManageIQ::Providers::AnsibleTower::AutomationManager", :gtl_dbname => "automation_manager_providers").and_call_original
      controller.send(:accordion_select)
    end

    it "calls get_view with the associated dbname for the Configured Systems accordion" do
      stub_user(:features => :all)
      allow(controller).to receive(:x_node).and_return("root")
      allow(controller).to receive(:x_tree).and_return(:type => :filter)
      controller.params = {:id => "automation_manager_cs_filter"}
      expect(controller).to receive(:get_view).with("ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem", :gtl_dbname => "automation_manager_configured_systems").and_call_original
      allow(controller).to receive(:build_listnav_search_list)
      controller.send(:accordion_select)
    end

    it "calls get_view with the associated dbname for the Configuration Scripts accordion" do
      stub_user(:features => :all)
      allow(controller).to receive(:x_active_tree).and_return(:configuration_scripts_tree)
      allow(controller).to receive(:x_active_accord).and_return(:configuration_scripts)
      controller.params = {:id => "configuration_scripts"}
      expect(controller).to receive(:get_view).with("ManageIQ::Providers::ExternalAutomationManager::ConfigurationScript", :gtl_dbname => "automation_manager_configuration_scripts").and_call_original
      controller.send(:accordion_select)
    end
  end

  it "singularizes breadcrumb name" do
    expect(controller.send(:breadcrumb_name, nil)).to eq("#{ui_lookup(:ui_title => "foreman")} Provider")
  end

  it "renders tagging editor for a configured system" do
    session[:tag_items] = [@ans_configured_system.id]
    session[:assigned_filters] = []
    allow(controller).to receive(:x_active_accord).and_return(:automation_manager_cs_filter)
    parent = FactoryBot.create(:classification)
    FactoryBot.create(:classification_tag, :parent => parent)
    FactoryBot.create(:classification_tag, :parent => parent)
    post :tagging, :params => { :id => @ans_configured_system.id, :format => :js }
    expect(response.status).to eq(200)
  end

  it "renders tree_select as js" do
    TreeBuilderAutomationManagerProviders.new(:automation_manager_providers_tree, controller.instance_variable_get(:@sb))

    allow(controller).to receive(:process_show_list)
    allow(controller).to receive(:replace_explorer_trees)
    allow(controller).to receive(:build_listnav_search_list)
    allow(controller).to receive(:rebuild_toolbars)
    allow(controller).to receive(:replace_search_box)
    allow(controller).to receive(:update_partials)

    stub_user(:features => :all)

    key = ems_key_for_provider(automation_provider1)
    post :tree_select, :params => { :id => key, :format => :js }
    expect(response.status).to eq(200)
  end

  context "tree_select on ansible tower provider node" do
    before do
      login_as user_with_feature %w(automation_manager_refresh_provider automation_manager_edit_provider automation_manager_delete_provider)

      allow(controller).to receive(:check_privileges)
      allow(controller).to receive(:process_show_list)
      allow(controller).to receive(:replace_explorer_trees)
      allow(controller).to receive(:build_listnav_search_list)
      allow(controller).to receive(:replace_search_box)
      allow(controller).to receive(:x_active_tree).and_return(:automation_manager_providers_tree)
    end

    it "does not hide Configuration button in the toolbar" do
      TreeBuilderAutomationManagerProviders.new(:automation_manager_providers_tree, controller.instance_variable_get(:@sb))
      key = ems_key_for_provider(automation_provider1)
      post :tree_select, :params => { :id => key, :format => :js }
      expect(response.status).to eq(200)
      expect(response.body).not_to include('<div class=\"hidden btn-group dropdown\"><button data-explorer=\"true\" title=\"Configuration\"')
    end
  end

  context "configured systems accordion" do
    it "renders textual summary for a configured system" do
      stub_user(:features => :all)

      tree_node_id = @ans_configured_system.id

      # post to x_show sets session variables and redirects to explorer
      # then get to explorer renders the data for the active node
      # we test the textual_summary for a configured system

      seed_session_trees('automation_manager', :automation_manager_cs_filter, "cs-#{tree_node_id}")
      get :explorer
      show_adv_search = controller.instance_variable_get(:@show_adv_search)
      expect(show_adv_search).to be_falsey
      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => 'layouts/_textual_groups_generic')
    end
  end

  context "ansible tower job template accordion " do
    before do
      login_as user_with_feature(%w(automation_manager_providers automation_manager_cs_filter_accord automation_manager_configuration_scripts_accord))
      controller.instance_variable_set(:@right_cell_text, nil)
    end

    render_views

    it 'can render details for a job template' do
      @record = FactoryBot.create(:ansible_configuration_script,
                                   :survey_spec => {'spec' => [{'index' => 0, 'question_description' => 'Survey',
                                                                'min' => nil, 'default' => nil, 'max' => nil,
                                                                'question_name' => 'Survey', 'required' => false,
                                                                'variable' => 'test', 'choices' => nil,
                                                                'type' => 'text'}]})
      tree_node_id = "cf-#{@record.id}"
      allow(controller).to receive(:x_active_tree).and_return(:configuration_scripts_tree)
      allow(controller).to receive(:x_active_accord).and_return(:configuration_scripts)
      allow(controller).to receive(:x_node).and_return(tree_node_id)
      get :explorer
      show_adv_search = controller.instance_variable_get(:@show_adv_search)
      expect(show_adv_search).to eq(false)
      expect(response.status).to eq(200)
      expect(response.body).to include("Question Name")
      expect(response.body).to include("Question Description")
    end
  end

  context "fetches the list for selected accordion" do
    before do
      login_as user_with_feature(%w(automation_manager_providers automation_manager_configured_system))
      allow(controller).to receive(:items_per_page).and_return(20)
      allow(controller).to receive(:current_page).and_return(1)
      allow(controller).to receive(:get_view_pages)
      allow(controller).to receive(:build_listnav_search_list)
      allow(controller).to receive(:load_or_clear_adv_search)
      allow(controller).to receive(:replace_search_box)
      allow(controller).to receive(:update_partials)
      allow(controller).to receive(:render)
      controller.send(:build_accordions_and_trees)
    end

    it "fetches list for Providers accordion" do
      key = ems_key_for_provider(automation_provider1)
      allow(controller).to receive(:x_active_tree).and_return(:automation_manager_providers_tree)
      controller.send(:get_node_info, key)
    end

    it "fetches list for Configured Systems accordion" do
      key = ems_key_for_provider(automation_provider1)
      allow(controller).to receive(:x_active_tree).and_return(:automation_manager_cs_filter_tree)
      controller.send(:get_node_info, key)
    end
  end

  describe "#build_credentials" do
    it "uses params[:default_password] for validation if one exists" do
      controller.params = {:default_userid   => "userid",
                           :default_password => "password2"}
      creds = {:userid => "userid", :password => "password2"}
      expect(controller.send(:build_credentials)).to include(:default => creds)
    end

    it "uses the stored password for validation if params[:default_password] does not exist" do
      controller.params = {:default_userid => "userid"}
      controller.instance_variable_set(:@provider, automation_provider1)
      expect(automation_provider1).to receive(:authentication_password).and_return('password')
      creds = {:userid => "userid", :password => "password"}
      expect(controller.send(:build_credentials)).to include(:default => creds)
    end
  end

  context "when user with specific tag settings logs in" do
    before do
      @user = user_with_feature %w(automation_manager_providers automation_manager_configured_system)
      login_as @user
    end

    it "builds foreman tree with no nodes after rbac filtering" do
      user_filters = {'belongs' => [], 'managed' => [tags]}
      allow(@user).to receive(:get_filters).and_return(user_filters)
      tree_objects = TreeBuilderAutomationManagerProviders.new(:automation_manager_providers_tree, controller.instance_variable_get(:@sb)).tree_nodes
      first_child = find_treenode_for_provider(automation_provider1, tree_objects)
      expect(first_child).to eq(nil)
    end
  end

  describe "#configscript_service_dialog" do
    before do
      stub_user(:features => :all)
      @cs = FactoryBot.create(:ansible_configuration_script)
      @dialog_label = "New Dialog 01"
      session[:edit] = {
        :new    => {:dialog_name => @dialog_label},
        :key    => "cs_edit__#{@cs.id}",
        :rec_id => @cs.id
      }
      controller.instance_variable_set(:@sb, :trees => {:configuration_scripts_tree => {:open_nodes => []}}, :active_tree => :configuration_scripts_tree)
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
    end

    after(:each) do
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(response.status).to eq(200)
    end

    it "renders tagging editor for a job template system" do
      session[:tag_items] = [@cs.id]
      session[:assigned_filters] = []
      allow(controller).to receive(:x_active_accord).and_return(:configuration_scripts)
      allow(controller).to receive(:tagging_explorer_controller?).and_return(true)
      parent = FactoryBot.create(:classification)
      FactoryBot.create(:classification_tag, :parent => parent)
      FactoryBot.create(:classification_tag, :parent => parent)
      post :tagging, :params => {:id => @cs.id, :format => :js}
      expect(response.status).to eq(200)
      expect(response.body).to include('Template (Ansible Tower) Being Tagged')
    end
  end

  describe "#tags_edit" do
    let!(:user) { stub_user(:features => :all) }

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      allow(@ans_configured_system).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryBot.create(:classification)
      @tag1 = FactoryBot.create(:classification_tag, :parent => classification)
      @tag2 = FactoryBot.create(:classification_tag, :parent => classification)
      allow(Classification).to receive(:find_assigned_entries).with(@ans_configured_system).and_return([@tag1, @tag2])
      session[:tag_db] = "ConfiguredSystem"
      edit = {:key        => "ConfiguredSystem_edit_tags__#{@ans_configured_system.id}",
              :tagging    => "ConfiguredSystem",
              :object_ids => [@ans_configured_system.id],
              :current    => {:assignments => []},
              :new        => {:assignments => [@tag1.id, @tag2.id]}}
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      post :tagging, :params => {:format => :js, :miq_grid_checks => [@ans_configured_system.id]}
      expect(assigns(:flash_array)).to be_nil
      expect(response.status).to eq(200)
    end

    it "cancels tags edit" do
      allow(controller).to receive(:previous_breadcrumb_url).and_return("previous-url")
      post :tagging_edit, :params => {:button => "cancel", :format => :js, :id => @ans_configured_system.id}
      expect(assigns(:flash_array).first[:message]).to include("was cancelled by the user")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      allow(controller).to receive(:previous_breadcrumb_url).and_return("previous-url")
      post :tagging_edit, :params => {:button => "save", :format => :js, :id => @ans_configured_system.id, :data => get_tags_json([@tag1, @tag2])}
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  describe '#show' do
    before { controller.params = {:id => @automation_manager1.id} }

    it 'displays Automation Manager provider through Tenants textual summary' do
      expect(controller).to receive(:build_accordions_and_trees)
      expect(controller).to receive(:generic_x_show)
      controller.send(:show)
      expect(controller.instance_variable_get(:@explorer)).to be(true)
      expect(controller.instance_variable_get(:@record)).to eq(@automation_manager1)
      expect(controller.x_node).to eq("at-#{controller.params[:id]}")
    end
  end

  def find_treenode_for_provider(provider, tree)
    key = ems_key_for_provider(provider)
    tree[0][:nodes]&.find { |c| c['key'] == key }
  end

  def ems_key_for_provider(provider)
    ems = ExtManagementSystem.find_by(:provider_id => provider.id)
    "at-#{ems.id}"
  end

  def inventory_group_key(inv_group)
    ig = ManageIQ::Providers::AutomationManager::InventoryGroup.find_by(:id => inv_group.id)
    "f-#{ig.id}"
  end

  def ems_id_for_provider(provider)
    ems = ExtManagementSystem.find_by(:provider_id => provider.id)
    ems.id
  end
end
