describe AutomationManagerController do
  render_views

  let(:zone) { EvmSpecHelper.local_miq_server.zone }
  let(:tags) { ["/managed/quota_max_memory/2048"] }
  let(:automation_provider1) { FactoryGirl.create(:provider_ansible_tower, :name => "ansibletest", :url => "10.8.96.107", :zone => zone) }
  let(:automation_provider2) { FactoryGirl.create(:provider_ansible_tower, :name => "ansibletest2", :url => "10.8.96.108", :zone => zone) }

  before(:each) do
    Tag.find_or_create_by(:name => tags.first)
    @automation_manager1 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider1.id)
    @automation_manager2 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider2.id)

    @inventory_group = ManageIQ::Providers::AutomationManager::InventoryRootGroup.create(:name => "testinvgroup", :ems_id => @automation_manager1.id)
    @inventory_group2 = ManageIQ::Providers::AutomationManager::InventoryRootGroup.create(:name => "testinvgroup2", :ems_id => @automation_manager2.id)
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

    @ans_job_template1 = FactoryGirl.create(:ansible_configuration_script, :name => "ConfigScript1", :manager_id => @automation_manager1.id)
    @ans_job_template2 = FactoryGirl.create(:ansible_configuration_script, :name => "ConfigScript2", :manager_id => @automation_manager2.id)
    @ans_job_template3 = FactoryGirl.create(:ansible_configuration_script, :name => "ConfigScript3", :manager_id => @automation_manager1.id)
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
    FactoryGirl.create(:provider_ansible_tower, :name => "ansibletest3", :url => "z_url", :zone => zone)
    FactoryGirl.create(:provider_ansible_tower, :name => "ansibletest4", :url => "a_url", :zone => zone)

    get :explorer, :params => {:sortby => '2'}
    expect(response.status).to eq(200)
    expect(response.body).to include("modelName: 'manageiq/providers/automation_managers'")
    expect(response.body).to include("activeTree: 'automation_manager_providers_tree'")
    expect(response.body).to include("gtlType: 'list'")
    expect(response.body).to include("isExplorer: 'true' === 'true' ? true : false")
    expect(response.body).to include("showUrl: '/automation_manager/x_show/'")
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
    before do
      login_as user_with_feature %w(automation_manager_provider_tag)
    end

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

  context "#edit" do
    before do
      stub_user(:features => :all)
    end

    it "renders the edit page when the manager id is supplied" do
      post :edit, :params => { :id => @automation_manager1.id }
      expect(response.status).to eq(200)
      right_cell_text = controller.instance_variable_get(:@right_cell_text)
      expect(right_cell_text).to eq(_("Edit Provider"))
    end

    it "should display the zone field" do
      new_zone = FactoryGirl.create(:zone, :name => "TestZone")
      controller.instance_variable_set(:@provider, automation_provider1)
      post :edit, :params => { :id => @automation_manager1.id }
      expect(response.status).to eq(200)
      expect(response.body).to include("option value=\\\"#{new_zone.name}\\\"")
    end

    it "should save the zone field" do
      new_zone = FactoryGirl.create(:zone, :name => "TestZone")
      controller.instance_variable_set(:@provider, automation_provider1)
      allow(controller).to receive(:leaf_record).and_return(false)
      post :edit, :params => { :button     => 'save',
                               :id         => @automation_manager1.id,
                               :zone       => new_zone.name,
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
      post :edit, :params => { "check_#{ApplicationRecord.compress_id(@automation_manager1.id)}" => "1" }
      expect(response.status).to eq(200)
    end
  end

  context "#refresh" do
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
      post :refresh, :params => { "check_#{ApplicationRecord.compress_id(@automation_manager1.id)}" => "1",
                                  "check_#{ApplicationRecord.compress_id(@automation_manager2.id)}" => "1" }
      expect(assigns(:flash_array).first[:message]).to include("Refresh Provider initiated for 2 providers")
    end
  end

  context "#delete" do
    before do
      stub_user(:features => :all)
    end

    it "deletes the provider when the manager id is supplied" do
      allow(controller).to receive(:replace_right_cell)
      post :delete, :params => { :id => @automation_manager1.id }
      expect(assigns(:flash_array).first[:message]).to include("Delete initiated for 1 Provider")
    end

    it "it deletes a provider when the manager id is selected from a list view" do
      allow(controller).to receive(:replace_right_cell)
      post :delete, :params => { :miq_grid_checks => "#{@automation_manager1.id}, #{@automation_manager2.id}"}
      expect(assigns(:flash_array).first[:message]).to include("Delete initiated for 2 Providers")
    end

    it "it deletes a provider when the manager id is selected from a grid/tile" do
      allow(controller).to receive(:replace_right_cell)
      post :delete, :params => { "check_#{ApplicationRecord.compress_id(@automation_manager1.id)}" => "1" }
      expect(assigns(:flash_array).first[:message]).to include("Delete initiated for 1 Provider")
    end
  end

  context "renders right cell text" do
    before do
      right_cell_text = nil
      login_as user_with_feature(%w(automation_manager_providers automation_manager_configured_system automation_manager_configuration_scripts_accord))
      controller.instance_variable_set(:@right_cell_text, right_cell_text)
      allow(controller).to receive(:get_view_calculate_gtl_type)
      allow(controller).to receive(:get_view_pages)
      allow(controller).to receive(:build_listnav_search_list)
      allow(controller).to receive(:load_or_clear_adv_search)
      allow(controller).to receive(:replace_search_box)
      allow(controller).to receive(:update_partials)
      allow(controller).to receive(:render)

      allow(controller).to receive(:items_per_page).and_return(20)
      allow(controller).to receive(:gtl_type).and_return("list")
      allow(controller).to receive(:current_page).and_return(1)
      controller.send(:build_accordions_and_trees)
    end
    it "renders right cell text for root node" do
      controller.send(:get_node_info, "root")
      right_cell_text = controller.instance_variable_get(:@right_cell_text)
      expect(right_cell_text).to eq("All Ansible Tower Providers")
    end
  end

  it "builds ansible tower child tree" do
    automation_manager1 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider1.id)
    automation_manager2 = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider2.id)
    user = login_as user_with_feature(%w(automation_manager_providers providers_accord automation_manager_configured_system automation_manager_configuration_scripts_accord))
    allow(User).to receive(:current_user).and_return(user)
    controller.send(:build_automation_manager_tree, :automation_manager_providers, :automation_manager_providers_tree)
    tree_builder = TreeBuilderAutomationManagerProviders.new("root", "", {})
    objects = tree_builder.send(:x_get_tree_roots, false, {})
    expected_objects = [automation_manager1, automation_manager2]
    expect(objects).to match_array(expected_objects)
  end

  it "constructs the ansible tower inventory tree node" do
    controller.send(:build_automation_manager_tree, :automation_manager_providers, :automation_manager_providers_tree)
    tree_builder = TreeBuilderAutomationManagerProviders.new("root", "", {})
    objects = tree_builder.send(:x_get_tree_objects, @inventory_group, nil, false, nil)
    expected_objects = [@ans_configured_system, @ans_configured_system2a]
    expect(objects).to match_array(expected_objects)
  end

  it "builds ansible tower job templates tree" do
    user = login_as user_with_feature(%w(automation_manager_providers providers_accord automation_manager_configured_system automation_manager_configuration_scripts_accord))
    allow(User).to receive(:current_user).and_return(user)
    controller.send(:build_automation_manager_tree, :configuration_scripts, :configuration_scripts_tree)
    tree_builder = TreeBuilderAutomationManagerConfigurationScripts.new("root", "", {})
    objects = tree_builder.send(:x_get_tree_roots, false, {})
    expect(objects).to include(@automation_manager1)
    expect(objects).to include(@automation_manager2)
  end

  it "constructs the ansible tower job templates tree node" do
    user = login_as user_with_feature(%w(providers_accord automation_manager_configured_system automation_manager_configuration_scripts_accord))
    allow(User).to receive(:current_user).and_return(user)
    controller.send(:build_automation_manager_tree, :configuration_scripts, :configuration_scripts_tree)
    tree_builder = TreeBuilderAutomationManagerConfigurationScripts.new("root", "", {})
    root_objects = tree_builder.send(:x_get_tree_roots, false, {})
    objects = tree_builder.send(:x_get_tree_cmat_kids, root_objects[1], false)
    expect(objects).to include(@ans_job_template1)
    expect(objects).to include(@ans_job_template3)
  end

  context "renders tree_select" do
    before do
      get :explorer
      right_cell_text = nil
      login_as user_with_feature(%w(automation_manager_providers automation_manager_configured_system automation_manager_configuration_scripts_accord))
      controller.instance_variable_set(:@right_cell_text, right_cell_text)
      allow(controller).to receive(:get_view_calculate_gtl_type)
      allow(controller).to receive(:get_view_pages)
      allow(controller).to receive(:build_listnav_search_list)
      allow(controller).to receive(:load_or_clear_adv_search)
      allow(controller).to receive(:replace_search_box)
      allow(controller).to receive(:update_partials)
      allow(controller).to receive(:render)

      allow(controller).to receive(:items_per_page).and_return(20)
      allow(controller).to receive(:gtl_type).and_return("list")
      allow(controller).to receive(:current_page).and_return(1)
      controller.send(:build_accordions_and_trees)
    end

    it "renders the list view based on the nodetype(root,provider) and the search associated with it" do
      controller.instance_variable_set(:@_params, :id => "root")
      controller.instance_variable_set(:@search_text, "manager")
      controller.send(:tree_select)
      view = controller.instance_variable_get(:@view)
      expect(view.table.data.size).to eq(2)

      ems_id = ems_key_for_provider(automation_provider1)
      controller.instance_variable_set(:@_params, :id => ems_id)
      controller.send(:tree_select)
      view = controller.instance_variable_get(:@view)
      expect(view.table.data[0].name).to eq("testinvgroup")

      controller.instance_variable_set(:@_params, :id => "at")
      controller.instance_variable_set(:@search_text, "2")
      controller.send(:tree_select)
      view = controller.instance_variable_get(:@view)
      expect(view.table.data[0].name).to eq("ansibletest2 Automation Manager")

      invgroup_id2 = inventory_group_key(@inventory_group2)
      controller.instance_variable_set(:@_params, :id => invgroup_id2)
      controller.send(:tree_select)
      view = controller.instance_variable_get(:@view)
      expect(view.table.data[0].hostname).to eq("test2b_ans_configured_system")

      controller.instance_variable_set(:@search_text, "2b")
      controller.send(:tree_select)
      view = controller.instance_variable_get(:@view)
      expect(view.table.data[0].hostname).to eq("test2b_ans_configured_system")

      allow(controller).to receive(:x_node).and_return("root")
      allow(controller).to receive(:x_tree).and_return(:type => :filter)
      controller.instance_variable_set(:@_params, :id => "automation_manager_cs_filter")
      controller.send(:accordion_select)
      controller.instance_variable_set(:@search_text, "brew")
      allow(controller).to receive(:x_tree).and_return(:type => :providers)
      controller.instance_variable_set(:@_params, :id => "automation_manager_providers")
      controller.send(:accordion_select)

      controller.instance_variable_set(:@_params, :id => "root")
      controller.send(:tree_select)
      search_text = controller.instance_variable_get(:@search_text)
      expect(search_text).to eq("manager")
      view = controller.instance_variable_get(:@view)
      show_adv_search = controller.instance_variable_get(:@show_adv_search)
      expect(view.table.data.size).to eq(2)
      expect(show_adv_search).to eq(true)
    end

    it "renders tree_select for ansible tower job templates tree node" do
      allow(controller).to receive(:x_active_tree).and_return(:configuration_scripts_tree)
      controller.instance_variable_set(:@_params, :id => "configuration_scripts")
      controller.send(:accordion_select)
      controller.instance_variable_set(:@_params, :id => "at-" + ApplicationRecord.compress_id(@automation_manager1.id))
      controller.send(:tree_select)
      view = controller.instance_variable_get(:@view)
      show_adv_search = controller.instance_variable_get(:@show_adv_search)
      expect(show_adv_search).to eq(true)
      expect(view.table.data.size).to eq(2)
      expect(show_adv_search).to eq(true)

      expect(view.table.data[0].name).to eq("ConfigScript1")
      expect(view.table.data[1].name).to eq("ConfigScript3")
    end

    it 'renders tree_select for one job template' do
      record = FactoryGirl.create(:ansible_configuration_script,
                                  :name        => "ConfigScriptTest1",
                                  :survey_spec => {'spec' => [{'index' => 0, 'question_description' => 'Survey',
                                                               'type' => 'text'}]})
      stub_user(:features => :all)
      allow(controller).to receive(:x_active_tree).and_return(:configuration_scripts_tree)
      allow(controller).to receive(:x_active_accord).and_return(:configuration_scripts)
      controller.instance_variable_set(:@_params, :id => "cf-" + ApplicationRecord.compress_id(record.id))
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
      controller.instance_variable_set(:@_params, :id => "automation_manager_providers")
      expect(controller).to receive(:get_view).with("ManageIQ::Providers::AnsibleTower::AutomationManager", :gtl_dbname => "automation_manager_providers").and_call_original
      controller.send(:accordion_select)
    end

    it "calls get_view with the associated dbname for the Configured Systems accordion" do
      stub_user(:features => :all)
      allow(controller).to receive(:x_node).and_return("root")
      allow(controller).to receive(:x_tree).and_return(:type => :filter)
      controller.instance_variable_set(:@_params, :id => "automation_manager_cs_filter")
      expect(controller).to receive(:get_view).with("ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem", :gtl_dbname => "automation_manager_configured_systems").and_call_original
      allow(controller).to receive(:build_listnav_search_list)
      controller.send(:accordion_select)
    end

    it "calls get_view with the associated dbname for the Configuration Scripts accordion" do
      stub_user(:features => :all)
      allow(controller).to receive(:x_active_tree).and_return(:configuration_scripts_tree)
      allow(controller).to receive(:x_active_accord).and_return(:configuration_scripts)
      controller.instance_variable_set(:@_params, :id => "configuration_scripts")
      expect(controller).to receive(:get_view).with("ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript", :gtl_dbname => "automation_manager_configuration_scripts").and_call_original
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
    parent = FactoryGirl.create(:classification, :name => "test_category")
    FactoryGirl.create(:classification_tag,      :name => "test_entry",         :parent => parent)
    FactoryGirl.create(:classification_tag,      :name => "another_test_entry", :parent => parent)
    post :tagging, :params => { :id => @ans_configured_system.id, :format => :js }
    expect(response.status).to eq(200)
  end

  it "renders tree_select as js" do
    controller.send(:build_automation_manager_tree, :automation_manager_providers, :automation_manager_providers_tree)

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
      controller.send(:build_automation_manager_tree, :automation_manager_provider, :automation_manager_providers_tree)
      key = ems_key_for_provider(automation_provider1)
      post :tree_select, :params => { :id => key, :format => :js }
      expect(response.status).to eq(200)
      expect(response.body).not_to include('<div class=\"hidden btn-group dropdown\"><button data-explorer=\"true\" title=\"Configuration\"')
    end
  end

  context "configured systems accordion" do
    it "renders textual summary for a configured system" do
      stub_user(:features => :all)

      tree_node_id = ApplicationRecord.compress_id(@ans_configured_system.id)

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
      @record = FactoryGirl.create(:ansible_configuration_script,
                                   :name        => "ConfigScript1",
                                   :survey_spec => {'spec' => [{'index' => 0, 'question_description' => 'Survey',
                                                                'min' => nil, 'default' => nil, 'max' => nil,
                                                                'question_name' => 'Survey', 'required' => false,
                                                                'variable' => 'test', 'choices' => nil,
                                                                'type' => 'text'}]})
      tree_node_id = "cf-" + ApplicationRecord.compress_id(@record.id)
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

  context "fetches the list setting:Grid/Tile/List from settings" do
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

      controller.instance_variable_set(:@settings,
                                       :views => {:automation_manager_providers          => "grid",
                                                  :automation_manager_configured_systems => "tile"})
      controller.send(:build_accordions_and_trees)
    end

    it "fetches list type = 'grid' from settings for Providers accordion" do
      key = ems_key_for_provider(automation_provider1)
      allow(controller).to receive(:x_active_tree).and_return(:automation_manager_providers_tree)
      controller.send(:get_node_info, key)
      list_type = controller.instance_variable_get(:@gtl_type)
      expect(list_type).to eq("grid")
    end

    it "fetches list type = 'tile' from settings for Configured Systems accordion" do
      key = ems_key_for_provider(automation_provider1)
      allow(controller).to receive(:x_active_tree).and_return(:automation_manager_cs_filter_tree)
      controller.send(:get_node_info, key)
      list_type = controller.instance_variable_get(:@gtl_type)
      expect(list_type).to eq("tile")
    end
  end

  context "#build_credentials" do
    it "uses params[:default_password] for validation if one exists" do
      controller.instance_variable_set(:@_params,
                                       :default_userid   => "userid",
                                       :default_password => "password2")
      creds = {:userid => "userid", :password => "password2"}
      expect(controller.send(:build_credentials)).to include(:default => creds)
    end

    it "uses the stored password for validation if params[:default_password] does not exist" do
      controller.instance_variable_set(:@_params, :default_userid => "userid")
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
      controller.send(:build_automation_manager_tree, :automation_manager_providers, :automation_manager_providers_tree)
      first_child = find_treenode_for_provider(automation_provider1)
      expect(first_child).to eq(nil)
    end
  end

  context "#configscript_service_dialog" do
    before(:each) do
      stub_user(:features => :all)
      @cs = FactoryGirl.create(:ansible_configuration_script)
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

    it "displays the new dialog form with no reset button" do
      post :x_button, :params => {:pressed => 'configscript_service_dialog', :id => @cs.id}
      expect(response.status).to eq(200)
      expect(response.body).to include('Save Changes')
      expect(response.body).not_to include('Reset')
    end

    it "Service Dialog is created from an Ansible Tower Job Template" do
      controller.instance_variable_set(:@_params, :button => "save", :id => @cs.id)
      allow(controller).to receive(:replace_right_cell)
      controller.send(:configscript_service_dialog_submit)
      expect(assigns(:flash_array).first[:message]).to include("was successfully created")
      expect(Dialog.where(:label => @dialog_label).first).not_to be_nil
      expect(assigns(:edit)).to be_nil
    end

    it "renders tagging editor for a job template system" do
      session[:tag_items] = [@cs.id]
      session[:assigned_filters] = []
      allow(controller).to receive(:x_active_accord).and_return(:configuration_scripts)
      allow(controller).to receive(:tagging_explorer_controller?).and_return(true)
      parent = FactoryGirl.create(:classification, :name => "test_category")
      FactoryGirl.create(:classification_tag,      :name => "test_entry",         :parent => parent)
      FactoryGirl.create(:classification_tag,      :name => "another_test_entry", :parent => parent)
      post :tagging, :params => {:id => @cs.id, :format => :js}
      expect(response.status).to eq(200)
      expect(response.body).to include('Job Template (Ansible Tower) Being Tagged')
    end
  end

  def user_with_feature(features)
    features = EvmSpecHelper.specific_product_features(*features)
    FactoryGirl.create(:user, :features => features)
  end

  def find_treenode_for_provider(provider)
    key = ems_key_for_provider(provider)
    tree = JSON.parse(controller.instance_variable_get(:@automation_manager_providers_tree))
    tree[0]['nodes'].find { |c| c['key'] == key } unless tree[0]['nodes'].nil?
  end

  def ems_key_for_provider(provider)
    ems = ExtManagementSystem.where(:provider_id => provider.id).first
    "at-" + ApplicationRecord.compress_id(ems.id)
  end

  def inventory_group_key(inv_group)
    ig =  ManageIQ::Providers::AutomationManager::InventoryGroup.where(:id => inv_group.id).first
    "f-" + ApplicationRecord.compress_id(ig.id)
  end

  def ems_id_for_provider(provider)
    ems = ExtManagementSystem.where(:provider_id => provider.id).first
    ems.id
  end
end
