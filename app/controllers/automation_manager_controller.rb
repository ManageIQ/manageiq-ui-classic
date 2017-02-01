class AutomationManagerController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::ManagerControllerMixin

  def self.model
    ManageIQ::Providers::AnsibleTower
  end

  def self.table_name
    @table_name ||= "automation_manager"
  end

  CM_X_BUTTON_ALLOWED_ACTIONS = {
    'configscript_service_dialog' => :configscript_service_dialog,
  }.freeze

  def self.model_to_name(provmodel)
    if provmodel.include?("ManageIQ::Providers::AnsibleTower")
      Dictionary.gettext('ansible_tower', :type => :ui_title, :translate => false)
    end
  end

  def self.model_to_type_name(provmodel)
    if provmodel.include?("ManageIQ::Providers::AnsibleTower")
      'ansible_tower'
    end
  end

  def model_to_name(provmodel)
    AutomationManagerController.model_to_name(provmodel)
  end

  def model_to_type_name(provmodel)
    AutomationManagerController.model_to_type_name(provmodel)
  end

  def managed_group_kls
    ManageIQ::Providers::AutomationManager::InventoryGroup
  end

  def manager_prefix
    'automation_manager'
  end

  def new
    assert_privileges("automation_manager_add_provider")
    @provider_manager = ManageIQ::Providers::AnsibleTower::AutomationManager.new
    @server_zones = Zone.in_my_region.order('lower(description)').pluck(:description, :name)
    render_form
  end

  def edit
    @server_zones = Zone.in_my_region.order('lower(description)').pluck(:description, :name)
    case params[:button]
    when "cancel"
      cancel_provider
    when "save"
      add_provider
      save_provider
    else
      assert_privileges("automation_manager_edit_provider")
      manager_id            = from_cid(params[:miq_grid_checks] || params[:id] || find_checked_items[0])
      @provider_manager     = find_record(ManageIQ::Providers::AnsibleTower::AutomationManager, manager_id)
      @providerdisplay_type = model_to_name(@provider_manager.type)
      render_form
    end
  end

  def delete
    assert_privileges("automation_manager_delete_provider")
    checked_items = find_checked_items
    checked_items.push(params[:id]) if checked_items.empty? && params[:id]
    providers = ManageIQ::Providers::AutomationManager.where(:id => checked_items).includes(:provider).collect(&:provider)
    if providers.empty?
      add_flash(_("No %{model} were selected for %{task}") % {:model => ui_lookup(:tables => "providers"), :task => "deletion"}, :error)
    else
      providers.each do |provider|
        AuditEvent.success(
          :event        => "provider_record_delete_initiated",
          :message      => "[#{provider.name}] Record delete initiated",
          :target_id    => provider.id,
          :target_class => provider.type,
          :userid       => session[:userid]
        )
        provider.destroy_queue
      end

      add_flash(n_("Delete initiated for %{count} Provider",
                   "Delete initiated for %{count} Providers",
                   providers.length) % {:count => providers.length})
    end
    replace_right_cell
  end

  def refresh
    assert_privileges("automation_manager_refresh_provider")
    @explorer = true
    manager_button_operation('refresh_ems', _('Refresh'))
    replace_right_cell
  end

  def tagging
    case x_active_accord
    when :automation_manager_providers
      assert_privileges("automation_manager_provider_configured_system_tag")
      tagging_edit('ConfiguredSystem', false)
    when :automation_manager_cs_filter
      assert_privileges("automation_manager_configured_system_tag")
      tagging_edit('ConfiguredSystem', false)
    when :configuration_scripts
      assert_privileges("automation_manager_configuration_script_tag")
      tagging_edit('ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript', false)
    end
    render_tagging_form
  end


  def automation_manager_form_fields
    assert_privileges("automation_manager_edit_provider")
    # set value of read only zone text box, when there is only single zone
    return render :json => {
                             :zone => Zone.in_my_region.size >= 1 ? Zone.in_my_region.first.name : nil
                           } if params[:id] == "new"

    manager = find_record(ManageIQ::Providers::AnsibleTower::AutomationManager, params[:id])
    provider   = manager.provider

    render :json => {:name       => provider.name,
                     :zone       => provider.zone.name,
                     :url        => provider.url,
                     :verify_ssl => provider.verify_ssl,
                     :log_userid => provider.authentications.first.userid}
  end

  def load_or_clear_adv_search
    adv_search_build("ConfiguredSystem")
    session[:edit] = @edit
    @explorer = true

    if x_active_tree != :automation_manager_cs_filter_tree || x_node == "root"
      listnav_search_selected(0)
    else
      @nodetype, id = parse_nodetype_and_id(valid_active_node(x_node))

      if x_active_tree == :automation_manager_cs_filter_tree
        search_id = @nodetype == "root" ? 0 : from_cid(id)
        listnav_search_selected(search_id) unless params.key?(:search_text) # Clear or set the adv search filter
        if @edit[:adv_search_applied] &&
           MiqExpression.quick_search?(@edit[:adv_search_applied][:exp]) &&
           %w(reload tree_select).include?(params[:action])
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
    @record =
      case x_active_tree
      when :automation_manager_providers_tree  then automation_manager_providers_tree_rec
      when :automation_manager_cs_filter_tree  then automation_manager_cs_filter_tree_rec
      when :configuration_scripts_tree then configuration_scripts_tree_rec
      end
  end

  def automation_manager_providers_tree_rec
    nodes = x_node.split('-')
    case nodes.first
    when "root" then find_record(ManageIQ::Providers::AnsibleTower::AutomationManager, params[:id])
    when "at"   then find_record(ManageIQ::Providers::AutomationManager::InventoryGroup, params[:id])
    when "f"    then find_record(ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem, params[:id])
    when "xx" then
      case nodes.second
      when "at"  then find_record(ManageIQ::Providers::AnsibleTower::AutomationManager, params[:id])
      when "csa" then find_record(ConfiguredSystem, params[:id])
      end
    end
  end

  def automation_manager_cs_filter_tree_rec
    nodes = x_node.split('-')
    case nodes.first
    when "root", "xx" then find_record(ConfiguredSystem, params[:id])
    when "ms"         then find_record(ConfiguredSystem, from_cid(params[:id]))
    end
  end

  def configuration_scripts_tree_rec
    nodes = x_node.split('-')
    case nodes.first
    when "root", "at"
      find_record(ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript, params[:id])
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

    if @record.kind_of?(ConfiguredSystem)
      rec_cls = "#{model_to_type_name(@record.ext_management_system.class.to_s)}_configured_system"
    end
    return unless @display == 'main'
    @button_group = case x_active_accord
                    when :automation_manager_cs_filter
                      rec_cls.to_s
                    when :automation_manager_providers
                      "automation_manager_#{rec_cls}"
                    when :configuration_scripts
                       @record.kind_of?(ConfigurationScript) ? "configuration_script" : "configuration_scripts"
                    end
  end

  def configscript_service_dialog_submit
    case params[:button]
    when "cancel"
      configscript_service_dialog_submit_cancel
    when "save"
      configscript_service_dialog_submit_save
    end
  end

  private ###########

  def provider_class
    ManageIQ::Providers::AnsibleTower::Provider
  end

  def find_or_build_provider
    @provider = provider_class.new if params[:id] == "new"
    @provider ||= find_record(ManageIQ::Providers::AutomationManager, params[:id]).provider
  end

  def features
    [
      {:role     => "automation_manager_providers",
       :role_any => true,
       :name     => :automation_manager_providers,
       :title    => _("Providers")},
      {:role     => "automation_manager_configured_system",
       :role_any => true,
       :name     => :automation_manager_cs_filter,
       :title    => _("Configured Systems")},
      {:role     => "automation_manager_configuration_scripts_accord",
       :role_any => true,
       :name     => :configuration_scripts,
       :title    => _("Job Templates")}
    ].map do |hsh|
      ApplicationController::Feature.new_with_hash(hsh)
    end
  end

  def build_automation_manager_tree(type, name)
    tree = case name
           when :automation_manager_providers_tree
             TreeBuilderAutomationManagerProviders.new(name, type, @sb)
           when :automation_manager_cs_filter_tree
             TreeBuilderAutomationManagerConfiguredSystems.new(name, type, @sb)
           else
             TreeBuilderAutomationManagerConfigurationScripts.new(name, type, @sb)
           end
    instance_variable_set :"@#{name}", tree.tree_nodes
    tree
  end

  def get_node_info(treenodeid)
    @sb[:action] = nil
    @nodetype, id = parse_nodetype_and_id(valid_active_node(treenodeid))

    model = TreeBuilder.get_model_for_prefix(@nodetype)
    if model == "Hash"
      model = TreeBuilder.get_model_for_prefix(id)
      id = nil
    end

    case model
    when "ManageIQ::Providers::AnsibleTower::AutomationManager"
      provider_list(id, model)
    when "EmsFolder"
      inventory_group_node(id, model)
    when "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem", "ConfiguredSystem"
      configured_system_list(id, model)
    when "ConfigurationScript"
      configuration_scripts_list(id, model)
    when "MiqSearch"
      miq_search_node
    else
      default_node
    end
    @right_cell_text += @edit[:adv_search_applied][:text] if x_tree && x_tree[:type] == :automation_manager_cs_filter && @edit && @edit[:adv_search_applied]

    if @edit && @edit.fetch_path(:adv_search_applied, :qs_exp) # If qs is active, save it in history
      x_history_add_item(:id     => x_node,
                         :qs_exp => @edit[:adv_search_applied][:qs_exp],
                         :text   => @right_cell_text)
    else
      x_history_add_item(:id => treenodeid, :text => @right_cell_text) # Add to history pulldown array
    end
  end

  def provider_node(id, model)
    @record = provider = find_record(ExtManagementSystem, id)
    if provider.nil?
      self.x_node = "root"
      get_node_info("root")
    elsif x_active_tree == :configuration_scripts_tree
      cs_provider_node(provider)
    else
      @no_checkboxes = true
      options = {:model                 => "ManageIQ::Providers::AutomationManager::InventoryGroup",
                 :match_via_descendants => ConfiguredSystem,
                 :where_clause          => ["ems_id IN (?)", provider.id]}
      process_show_list(options)
      record_model = ui_lookup(:model => model_to_name(model || TreeBuilder.get_model_for_prefix(@nodetype)))
      @right_cell_text = _("%{model} \"%{name}\"") % {:name  => provider.name,
                                                      :model => "#{ui_lookup(:tables => "inventory_group")} under #{record_model} Provider"}
    end
  end

  def cs_provider_node(provider)
    options = {:model                 => "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript",
               :match_via_descendants => ConfigurationScript,
               :where_clause          => ["manager_id IN (?)", provider.id]}
    process_show_list(options)
    @right_cell_text = _("%{model} \"%{name}\"") % {:name  => provider.name,
                                                    :model => "#{ui_lookup(:tables => "job_templates")} under "}
  end

  def inventory_group_node(id, model)
    @record = @inventory_group_record = find_record(ManageIQ::Providers::AutomationManager::InventoryGroup, id) if model

    if @inventory_group_record.nil?
      self.x_node = "root"
      get_node_info("root")
    else
      options = {:model => "ConfiguredSystem", :match_via_descendants => ConfiguredSystem}
      options[:where_clause] = ["inventory_root_group_id IN (?)", from_cid(@inventory_group_record.id)]
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
    @listicon = "configuration_script"
    if x_active_tree == :configuration_scripts_tree
      options = {:model => model.to_s}
      @right_cell_text = _("All Ansible Tower Job Templates")
      process_show_list(options)
    end
  end

  def configuration_script_node(id)
    @record = @configuration_script_record = find_record(ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript, id)
    display_node(id, nil)
  end

  def default_node
    return unless x_node == "root"
    if x_active_tree == :automation_manager_providers_tree
      options = {:model => "ManageIQ::Providers::AnsibleTower::AutomationManager"}
      process_show_list(options)
      @right_cell_text = _("All Ansible Tower Providers")
    elsif x_active_tree == :automation_manager_cs_filter_tree
      options = {:model => "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem"}
      process_show_list(options)
      @right_cell_text = _("All Ansible Tower Configured Systems")
    elsif x_active_tree == :configuration_scripts_tree
      options = {:model => "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript"}
      process_show_list(options)
      @right_cell_text = _("All Ansible Tower Job Templates")
    end
  end


  def rebuild_trees(replace_trees)
    trees = {}
    if replace_trees
      if replace_trees.include?(:automation_manager_providers)
        trees[:automation_manager_providers] = build_automation_manager_tree(:automation_manager_providers,
                                                                             :automation_manager_providers_tree)
      end
      if replace_trees.include?(:automation_manager_cs_filter)
        trees[:automation_manager_cs_filter] = build_automation_manager_tree(:automation_manager_cs_filter,
                                                                             :automation_manager_cs_filter_tree)
      end
      if replace_trees.include?(:configuration_scripts)
        trees[:configuration_scripts] = build_automation_manager_tree(:configuration_scripts,
                                                                      :configuration_scripts_tree)
      end
    end
    trees
  end

  def leaf_record
    get_node_info(x_node)
    @delete_node = params[:id] if @replace_trees
    type, _id = parse_nodetype_and_id(x_node)
    type && %w(ConfiguredSystem ConfigurationScript).include?(TreeBuilder.get_model_for_prefix(type))
  end

  def managed_group_record?(node = x_node)
    type, _id = parse_nodetype_and_id(node)
    type && %w(EmsFolder).include?(TreeBuilder.get_model_for_prefix(type))
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

  def update_partials(record_showing, presenter, r)
    if record_showing && valid_configured_system_record?(@configured_system_record)
      get_tagdata(@record)
      presenter.hide(:form_buttons_div)
      path_dir = controller_name
      presenter.update(:main_div, r[:partial => "#{path_dir}/main",
                                    :locals  => {:controller => controller_name}])
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
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "inventory_group",
                                    :locals  => {:controller => controller_name}])
    elsif valid_configuration_script_record?(@configuration_script_record)
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "configuration_script",
                                    :locals  => {:controller => controller_name}])
    else
      presenter.update(:main_div, r[:partial => 'layouts/x_gtl'])
    end
  end

  def group_summary_tab_selected?
    @inventory_group_record && @sb[:active_tab] == 'summary'
  end

  def locals_for_service_dialog
    {:action_url => 'service_dialog',
     :no_reset   => true,
     :record_id  => @sb[:rec_id] || @edit[:object_ids] && @edit[:object_ids][0]}
  end

  def update_service_dialog_partials(presenter, r)
    presenter.update(:main_div, r[:partial => 'configscript_service_dialog',
                                  :locals  => locals_for_service_dialog])
    locals = {:record_id  => @edit[:rec_id],
              :action_url => "configscript_service_dialog_submit",
              :no_reset   => true,
              :serialize  => true}
    presenter.update(:form_buttons_div, r[:partial => 'layouts/x_edit_buttons', :locals => locals])
  end

  def active_tab_configured_systems?
    (%w(x_show x_search_by_name).include?(action_name) && managed_group_record?)
  end

  def empty_managed_group_record?(inventory_group_record)
    inventory_group_record.try(:id).nil?
  end

  def valid_managed_group_record?(inventory_group_record)
    inventory_group_record.try(:id)
  end

  def inventory_group_right_cell_text(model)
    return if @sb[:active_tab] != 'configured_systems'
    if valid_managed_group_record?(@inventory_group_record)
      record_model = ui_lookup(:model => model || TreeBuilder.get_model_for_prefix(@nodetype))
      @right_cell_text = _("%{model} under Inventory Group \"%{name}\"") %
                         {:model        => ui_lookup(:tables => "configured_system"),
                          :record_model => record_model,
                          :name         => @inventory_group_record.name}
    end
  end

  def valid_configuration_script_record?(configuration_script_record)
    configuration_script_record.try(:id)
  end

  def process_show_list(options = {})
    options[:dbname] = case x_active_accord
                       when :automation_manager_providers
                         options[:model] && options[:model] == 'ConfiguredSystem' ? :automation_manager_configured_systems : :automation_manager_providers
                       when :automation_manager_cs_filter
                         :automation_manager_configured_systems
                       when :configuration_scripts
                         :configuration_scripts
                       end
    super
  end

  def configscript_service_dialog
    assert_privileges("automation_manager_configuration_script_service_dialog")
    cs = ManageIQ::Providers::AnsibleTower::AutomationManager::ConfigurationScript.find_by(:id => params[:id])
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

  menu_section :aut
end
