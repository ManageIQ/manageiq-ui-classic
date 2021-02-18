class AutomationManagerController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::ManagerControllerMixin
  include Mixins::AutomationManagerControllerMixin
  include Mixins::ExplorerPresenterMixin
  include Mixins::EmsCommon::Core
  include Mixins::EmsCommon::PauseResume
  include Mixins::BreadcrumbsMixin

  menu_section :at
  feature_for_actions "#{controller_name}_providers", *ADV_SEARCH_ACTIONS

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
    assert_privileges('automation_manager_providers_view')
    tree_record

    if request.format.js? && !@record
      return
    end

    generic_x_show
  end

  # Display provider through Tenant's textual summary
  def show
    assert_privileges('automation_manager_providers_view')
    @explorer = true
    @lastaction = 'explorer'

    build_accordions_and_trees

    self.x_node = "at-#{params[:id]}"
    @record = ExtManagementSystem.find_by(:id => params[:id])
    generic_x_show
  end

  def tree_record
    @record = case x_active_tree
              when :automation_manager_providers_tree then automation_manager_providers_tree_rec
              when :automation_manager_cs_filter_tree then automation_manager_cs_filter_tree_rec
              end
  end

  def class_for_provider_node
    nodes = x_node.split('-')
    case nodes.first
    when "root"    then ManageIQ::Providers::AnsibleTower::AutomationManager
    when "at", "e" then ManageIQ::Providers::AutomationManager::InventoryRootGroup
    when "f", "cs" then ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem
    when "xx"
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

  def validate_before_save?
    true
  end

  def providers_active_tree?
    x_active_tree == :automation_manager_providers_tree
  end

  def download_data
    assert_privileges('automation_manager_providers_view')
    super
  end

  def download_summary_pdf
    assert_privileges('automation_manager_providers_view')
    super
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
    when "MiqSearch"
      miq_search_node
    else
      default_node
    end

    # Edit right cell text if searching text
    @right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && %w[ConfiguredSystem].exclude?(model)
    # Edit right cell text if using filter
    @right_cell_text += @edit[:adv_search_applied][:text] if x_tree && filtering? && @edit && @edit[:adv_search_applied]
    {:view => @view, :pages => @pages}
  end

  def filtering?
    %w[automation_manager_cs_filter_tree].include?(x_tree[:tree].to_s)
  end

  def provider_node(id, model)
    @record = provider = find_record(ExtManagementSystem, id)
    if provider.nil?
      self.x_node = "root"
      get_node_info("root")
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
    end
  end

  def rebuild_trees(replace_trees)
    build_replaced_trees(replace_trees, %i[automation_manager_providers automation_manager_cs_filter])
  end

  def leaf_record
    get_node_info(x_node)
    @delete_node = params[:id] if @replace_trees
    type, _id = parse_nodetype_and_id(x_node)
    type && %w[ConfiguredSystem ConfigurationWorkflow].include?(TreeBuilder.get_model_for_prefix(type))
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
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "inventory_group",
                                    :locals  => {:controller => controller_name}])
    elsif concrete_model.none? && x_active_tree == :automation_manager_providers_tree
      presenter.update(:main_div, r[:partial => "layouts/empty",
                                    :locals  => {:add_message   => _("Add a new Ansible Tower Provider"),
                                                 :documentation => ::Settings.docs.ansible_provider}])
    else
      presenter.update(:main_div, r[:partial => 'layouts/x_gtl'])
    end
    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    replace_search_box(presenter, :nameonly => providers_active_tree?)
  end

  def group_summary_tab_selected?
    @inventory_group_record && @sb[:active_tab] == 'summary'
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

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Ansible Tower")},
        {:title => _("Explorer")},
      ],
    }
  end
end
