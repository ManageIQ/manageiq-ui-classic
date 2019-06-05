class AutomationManagerController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::ManagerControllerMixin
  include Mixins::ExplorerPresenterMixin
  include Mixins::EmsCommon::Core
  include Mixins::EmsCommon::PauseResume
  include Mixins::BreadcrumbsMixin

  menu_section :at

  def self.model
    ManageIQ::Providers::AutomationManager
  end

  def self.table_name
    @table_name ||= "automation_manager"
  end

  def self.model_to_name(provmodel)
    if provmodel.include?("ManageIQ::Providers::AnsibleTower")
      Dictionary.gettext('ansible_tower', :type => :ui_title, :translate => false)
    end
  end

  def concrete_model
    ManageIQ::Providers::AnsibleTower::AutomationManager
  end

  def managed_group_kls
    ManageIQ::Providers::AutomationManager::InventoryRootGroup
  end

  def manager_prefix
    'automation_manager'
  end

  def privilege_prefix
    'automation_manager'
  end

  def tagging
    @explorer ||= true
    case x_active_accord
    when :automation_manager_providers
      assert_privileges("automation_manager_provider_tag")
      tagging_edit(class_for_provider_node.to_s, false)
    when :automation_manager_cs_filter
      assert_privileges("automation_manager_configured_system_tag")
      tagging_edit('ConfiguredSystem', false)
    when :configuration_scripts
      assert_privileges("automation_manager_configuration_script_tag")
      tagging_edit('ConfigurationScript', false)
    end
    render_tagging_form
  end

  def load_or_clear_adv_search
    adv_search_build(configuration_manager_scripts_tree(x_active_tree))
    session[:edit] = @edit
    @explorer = true

    if !filtering? || x_node == "root"
      listnav_search_selected(0)
    else
      @nodetype, id = parse_nodetype_and_id(valid_active_node(x_node))

      if filtering? && %w[xx-csa ms].include?(@nodetype)
        search_id = id
        listnav_search_selected(search_id) unless params.key?(:search_text) # Clear or set the adv search filter
        if @edit[:adv_search_applied] &&
           MiqExpression.quick_search?(@edit[:adv_search_applied][:exp]) &&
           %w[reload tree_select].include?(params[:action])
          self.x_node = params[:id]
          quick_search_show
        end
      end
    end
  end

  def x_show
    tree_record

    if request.format.js? && !@record
      return
    end

    generic_x_show
  end

  def tree_record
    @record = case x_active_tree
              when :automation_manager_providers_tree then automation_manager_providers_tree_rec
              when :automation_manager_cs_filter_tree then automation_manager_cs_filter_tree_rec
              when :configuration_scripts_tree        then configuration_scripts_tree_rec
              end
  end

  def class_for_provider_node
    nodes = x_node.split('-')
    case nodes.first
    when "root"    then ManageIQ::Providers::AnsibleTower::AutomationManager
    when "at", "e" then ManageIQ::Providers::AutomationManager::InventoryRootGroup
    when "f", "cs" then ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem
    when "xx"      then
      case nodes.second
      when "at"  then ManageIQ::Providers::AnsibleTower::AutomationManager
      when "csa" then ConfiguredSystem
      end
    end
  end

  def automation_manager_providers_tree_rec
    find_record(class_for_provider_node, params[:id])
  end

  def automation_manager_cs_filter_tree_rec
    nodes = x_node.split('-')
    case nodes.first
    when "root", "xx" then find_record(ConfiguredSystem, params[:id])
    when "ms"         then find_record(ConfiguredSystem, params[:id])
    end
  end

  def configuration_scripts_tree_rec
    nodes = x_node.split('-')
    case nodes.first
    when "root", "at", "cf", "cw"
      find_record(ConfigurationScript, params[:id])
    end
  end

  def show_record(_id = nil)
    @display    = params[:display] || "main" unless pagination_or_gtl_request?
    @lastaction = "show"

    if @record.nil?
      add_flash(_("Error: Record no longer exists in the database"), :error)
      if request.xml_http_request? && params[:id]  # Is this an Ajax request clicking on a node that no longer exists?
        @delete_node = params[:id]                 # Set node to be removed from the tree
      end
      return
    end

    return unless @display == 'main'
  end

  def configscript_service_dialog_submit
    case params[:button]
    when "cancel"
      configscript_service_dialog_submit_cancel
    when "save"
      configscript_service_dialog_submit_save
    end
  end

  def validate_before_save?
    true
  end

  def providers_active_tree?
    x_active_tree == :automation_manager_providers_tree
  end

  private

  def automation_manager_pause
    pause_or_resume_emss(:pause => true)
  end

  def automation_manager_resume
    pause_or_resume_emss(:resume => true)
  end

  def template_record?
    @record.kind_of?(ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationWorkflow) || @record.kind_of?(ConfigurationScript)
  end
  helper_method :template_record?

  def textual_group_list
    [%i[properties tags]]
  end
  helper_method :textual_group_list

  def provider_class
    ManageIQ::Providers::AnsibleTower::Provider
  end

  def features
    [
      {
        :role     => "automation_manager_providers",
        :role_any => true,
        :name     => :automation_manager_providers,
        :title    => _("Providers")
      },
      {
        :role     => "automation_manager_configured_system",
        :role_any => true,
        :name     => :automation_manager_cs_filter,
        :title    => _("Configured Systems")
      },
      {
        :role     => "automation_manager_configuration_scripts_accord",
        :role_any => true,
        :name     => :configuration_scripts,
        :title    => _("Templates")
      }
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def get_node_info(treenodeid, _show_list = true)
    @sb[:action] = nil
    @nodetype, id = parse_nodetype_and_id(valid_active_node(treenodeid))

    model = TreeBuilder.get_model_for_prefix(@nodetype)
    if model == "Hash"
      model = TreeBuilder.get_model_for_prefix(id)
      id = nil
    end

    case model
    when "ManageIQ::Providers::AnsibleTower::AutomationManager", "ExtManagementSystem"
      provider_list(id, "ManageIQ::Providers::AnsibleTower::AutomationManager")
    when "EmsFolder"
      inventory_group_node(id, model)
    when "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem", "ConfiguredSystem"
      configured_system_list(id, model)
    when "ConfigurationScript", "ConfigurationWorkflow"
      configuration_scripts_list(id, model)
    when "MiqSearch"
      miq_search_node
    else
      default_node
    end

    # Edit right cell text if searching text
    @right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && %w[ConfiguredSystem ConfigurationScript].exclude?(model)
    # Edit right cell text if using filter
    @right_cell_text += @edit[:adv_search_applied][:text] if x_tree && filtering? && @edit && @edit[:adv_search_applied]

    if @edit && @edit.fetch_path(:adv_search_applied, :qs_exp) # If qs is active, save it in history
      x_history_add_item(:id     => x_node,
                         :qs_exp => @edit[:adv_search_applied][:qs_exp],
                         :text   => @right_cell_text)
    else
      x_history_add_item(:id => treenodeid, :text => @right_cell_text) # Add to history pulldown array
    end
    {:view => @view, :pages => @pages}
  end

  def filtering?
    %w[automation_manager_cs_filter_tree configuration_scripts_tree].include?(x_tree[:tree].to_s)
  end

  def provider_node(id, model)
    @record = provider = find_record(ExtManagementSystem, id)
    if provider.nil?
      self.x_node = "root"
      get_node_info("root")
    elsif x_active_tree == :configuration_scripts_tree
      cs_provider_node(provider)
    else
      @show_adv_search = false
      @no_checkboxes = true
      options = {:model                 => "ManageIQ::Providers::AutomationManager::InventoryRootGroup",
                 :match_via_descendants => 'ConfiguredSystem',
                 :named_scope           => [[:with_provider, provider.id]],
                 :gtl_dbname            => "automation_manager_providers"}
      process_show_list(options)
      record_model = ui_lookup(:model => self.class.model_to_name(model || TreeBuilder.get_model_for_prefix(@nodetype)))
      @right_cell_text = _("Inventory Groups under %{record_model} Provider \"%{name}\"") %
        {:name => provider.name, :record_model => record_model}
    end
  end

  def cs_provider_node(provider)
    options = {:model       => "ConfigurationScript",
               :named_scope => [[:with_manager, provider.id]],
               :gtl_dbname  => "automation_manager_configuration_scripts"}
    @show_adv_search = true
    process_show_list(options)
    @right_cell_text = _("Templates under \"%{name}\"") % {:name => provider.name}
  end

  def inventory_group_node(id, model)
    @record = @inventory_group_record = find_record(ManageIQ::Providers::AutomationManager::InventoryRootGroup, id) if model

    if @inventory_group_record.nil?
      self.x_node = "root"
      get_node_info("root")
    else
      @show_adv_search = false
      options = {:model       => "ConfiguredSystem",
                 :named_scope => [[:with_inventory_root_group, @inventory_group_record.id]],
                 :gtl_dbname  => "automation_manager_configured_systems"}
      process_show_list(options)
      record_model = ui_lookup(:model => model || TreeBuilder.get_model_for_prefix(@nodetype))
      if @sb[:active_tab] == 'configured_systems'
        inventory_group_right_cell_text(model)
      else
        @pages           = nil
        @right_cell_text = _("%{model} \"%{name}\"") % {:name => @inventory_group_record.name, :model => record_model}
      end
    end
  end

  def configuration_scripts_list(id, model)
    return configuration_script_node(id) if id
    @show_adv_search = true
    if x_active_tree == :configuration_scripts_tree
      options = {:model      => model.to_s,
                 :gtl_dbname => "configuration_scripts"}
      @right_cell_text = _("All Ansible Tower Templates")
      process_show_list(options)
    end
  end

  def configuration_script_node(id)
    @record = @configuration_script_record = find_record(ConfigurationScript, id)
    @show_adv_search = false
    display_node(id, nil)
  end

  def default_node
    return unless x_node == "root"
    @show_adv_search = true
    if x_active_tree == :automation_manager_providers_tree
      options = {:model      => "ManageIQ::Providers::AnsibleTower::AutomationManager",
                 :gtl_dbname => "automation_manager_providers"}
      process_show_list(options)
      @right_cell_text = _("All Ansible Tower Providers")
    elsif x_active_tree == :automation_manager_cs_filter_tree
      options = {:model      => "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem",
                 :gtl_dbname => "automation_manager_configured_systems"}
      process_show_list(options)
      @right_cell_text = _("All Ansible Tower Configured Systems")
    elsif x_active_tree == :configuration_scripts_tree
      options = {:model      => "ConfigurationScript",
                 :gtl_dbname => "automation_manager_configuration_scripts"}
      process_show_list(options)
      @right_cell_text = _("All Ansible Tower Templates")
    end
  end

  def rebuild_trees(replace_trees)
    build_replaced_trees(replace_trees, %i[automation_manager_providers automation_manager_cs_filter configuration_scripts])
  end

  def leaf_record
    get_node_info(x_node)
    @delete_node = params[:id] if @replace_trees
    type, _id = parse_nodetype_and_id(x_node)
    type && %w[ConfiguredSystem ConfigurationScript ConfigurationWorkflow].include?(TreeBuilder.get_model_for_prefix(type))
  end

  def managed_group_record?(node = x_node)
    type, _id = parse_nodetype_and_id(node)
    type && %w[EmsFolder].include?(TreeBuilder.get_model_for_prefix(type))
  end

  def automation_manager_manager_record?(node = x_node)
    return @record.kind_of?(ManageIQ::Providers::AnsibleTower::AutomationManager) if @record

    type, _id = node.split("-")
    type && ["ManageIQ::Providers::AnsibleTower::AutomationManager"].include?(TreeBuilder.get_model_for_prefix(type))
  end

  def provider_record?(node = x_node)
    automation_manager_manager_record?(node)
  end

  def search_text_type(node)
    return "provider" if provider_record?(node)
    return "inventory_group" if managed_group_record?(node)
    node
  end

  def update_partials(record_showing, presenter)
    if record_showing && valid_configured_system_record?(@configured_system_record)
      get_tagdata(@record)
      presenter.remove_sand
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "layouts/textual_groups_generic"])
    elsif @in_a_form
      partial_locals = {:controller => controller_name}
      @right_cell_text =
        if @sb[:action] == "automation_manager_add_provider"
          _("Add a new Automation Manager Provider")
        elsif @sb[:action] == "automation_manager_edit_provider"
          _("Edit Provider")
        end
      partial = 'form'
      presenter.update(:main_div, r[:partial => partial, :locals => partial_locals])
    elsif valid_managed_group_record?(@inventory_group_record)
      presenter.remove_sand
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "inventory_group",
                                    :locals  => {:controller => controller_name}])
    elsif valid_configuration_script_record?(@configuration_script_record)
      presenter.remove_sand
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "configuration_script",
                                    :locals  => {:controller => controller_name}])
    else
      presenter.update(:main_div, r[:partial => 'layouts/x_gtl'])
    end
    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    replace_search_box(presenter, :nameonly => providers_active_tree?)
  end

  def group_summary_tab_selected?
    @inventory_group_record && @sb[:active_tab] == 'summary'
  end

  def locals_for_service_dialog
    {:action_url => 'service_dialog',
     :no_reset   => true,
     :record_id  => @sb[:rec_id] || @edit[:object_ids] && @edit[:object_ids][0]}
  end

  def update_service_dialog_partials(presenter)
    presenter.update(:main_div, r[:partial => 'configscript_service_dialog',
                                  :locals  => locals_for_service_dialog])
    locals = {:record_id  => @edit[:rec_id],
              :action_url => "configscript_service_dialog_submit",
              :no_reset   => true,
              :serialize  => true}
    presenter.update(:form_buttons_div, r[:partial => 'layouts/x_edit_buttons', :locals => locals])
  end

  def active_tab_configured_systems?
    (%w[x_show x_search_by_name].include?(action_name) && managed_group_record?)
  end

  def valid_managed_group_record?(inventory_group_record)
    inventory_group_record.try(:id)
  end

  def inventory_group_right_cell_text(_model)
    return if @sb[:active_tab] != 'configured_systems'
    if valid_managed_group_record?(@inventory_group_record)
      @right_cell_text = _("Configured Systems under Inventory Group \"%{name}\"") %
        {:name => @inventory_group_record.name}
    end
  end

  def valid_configuration_script_record?(configuration_script_record)
    configuration_script_record.try(:id)
  end

  def configscript_service_dialog
    assert_privileges("automation_manager_configuration_script_service_dialog")
    cs = ConfigurationScript.find_by(:id => params[:id])
    @edit = {:new    => {:dialog_name => ""},
             :key    => "cs_edit__#{cs.id}",
             :rec_id => cs.id}
    @in_a_form = true
    @right_cell_text = _("Adding a new Service Dialog from \"%{name}\"") % {:name => cs.name}
    render_service_dialog_form
  end

  def configscript_service_dialog_submit_cancel
    add_flash(_("Creation of a new Service Dialog was cancelled by the user"))
    @in_a_form = false
    @edit = @record = nil
    replace_right_cell
  end

  def configscript_service_dialog_submit_save
    assert_privileges("automation_manager_configuration_script_service_dialog")
    load_edit("cs_edit__#{params[:id]}", "replace_cell__explorer")
    begin
      cs = ConfigurationScript.find_by(:id => params[:id])
      AnsibleTowerJobTemplateDialogService.new.create_dialog(cs, @edit[:new][:dialog_name])
    rescue => bang
      add_flash(_("Error when creating Service Dialog: %{error_message}") %
                  {:error_message => bang.message}, :error)
      javascript_flash
    else
      add_flash(_("Service Dialog \"%{name}\" was successfully created") %
                  {:name => @edit[:new][:dialog_name]}, :success)
      @in_a_form = false
      @edit = @record = nil
      replace_right_cell
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Automation")},
        {:title => _("Ansible Tower")},
        {:title => _("Explorer")},
      ],
      :record_title => :hostname,
      :show_header  => true,
    }
  end
end
