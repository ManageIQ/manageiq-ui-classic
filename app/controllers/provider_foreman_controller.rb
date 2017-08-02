class ProviderForemanController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::ManagerControllerMixin
  include Mixins::ExplorerPresenterMixin

  def self.model
    ManageIQ::Providers::ConfigurationManager
  end

  def self.table_name
    @table_name ||= "provider_foreman"
  end

  def self.model_to_name(provmodel)
    if provmodel.include?("ManageIQ::Providers::Foreman")
      Dictionary.gettext('foreman', :type => :ui_title, :translate => false)
    end
  end

  def concrete_model
    ManageIQ::Providers::ConfigurationManager
  end

  def managed_group_kls
    ConfigurationProfile
  end

  def manager_prefix
    'configuration_manager'
  end

  def privilege_prefix
    'provider_foreman'
  end

  def provision
    assert_privileges("provider_foreman_configured_system_provision") if x_active_accord == :configuration_manager_providers
    assert_privileges("configured_system_provision") if x_active_accord == :configuration_manager_cs_filter
    provisioning_ids = find_checked_ids_with_rbac(ConfiguredSystem)
    provisioning_ids.push(find_id_with_rbac(ConfiguredSystem, params[:id])) if provisioning_ids.empty?

    unless ConfiguredSystem.provisionable?(provisioning_ids)
      add_flash(_("Provisioning is not supported for at least one of the selected systems"), :error)
      replace_right_cell
      return
    end

    if ConfiguredSystem.common_configuration_profiles_for_selected_configured_systems(provisioning_ids)
      javascript_redirect :controller     => "miq_request",
                          :action         => "prov_edit",
                          :prov_id        => provisioning_ids,
                          :org_controller => "configured_system",
                          :escape         => false
    else
      add_flash(n_("No common configuration profiles available for the selected configured system",
                   "No common configuration profiles available for the selected configured systems",
                   provisioning_ids.size), :error)
      replace_right_cell
    end
  end

  def tagging
    @explorer = true
    case x_active_accord
    when :configuration_manager_providers
      assert_privileges("configuration_manager_provider_tag")
      tagging_edit('ManageIQ::Providers::ConfigurationManager', false)
    when :configuration_manager_cs_filter
      assert_privileges("configured_system_tag")
      tagging_edit('ConfiguredSystem', false)
    end
    render_tagging_form
  end

  def load_or_clear_adv_search
    adv_search_build("ConfiguredSystem")
    session[:edit] = @edit
    @explorer = true

    if (x_active_tree != :configuration_manager_cs_filter_tree || x_node == "root") && params[:button] != 'saveit'
      listnav_search_selected(0)
    else
      @nodetype, id = parse_nodetype_and_id(valid_active_node(x_node))

      if x_active_tree == :cs_filter_tree && @nodetype == "xx-csf"
        search_id = @nodetype == "root" ? 0 : from_cid(id)
        listnav_search_selected(search_id) unless params.key?(:search_text) # Clear or set the adv search filter
        if @edit[:adv_search_applied] &&
           MiqExpression.quick_search?(@edit[:adv_search_applied][:exp]) &&
           %w(reload tree_select).include?(params[:action])
          self.x_node = params[:id]
          quick_search_show
        end
      elsif x_active_tree == :configuration_manager_cs_filter_tree && params[:button] != 'saveit'
        listnav_search_selected(from_cid(id))
      end
    end
  end

  def x_show
    tree_record unless unassigned_configuration_profile?(params[:id])

    if request.format.js? && !@record
      check_for_unassigned_configuration_profile
      return
    end

    generic_x_show
  end

  def tree_record
    @record =
      case x_active_tree
      when :configuration_manager_providers_tree then configuration_manager_providers_tree_rec
      when :configuration_manager_cs_filter_tree then configuration_manager_cs_filter_tree_rec
      end
  end

  def check_for_unassigned_configuration_profile
    if action_name == "x_show"
      unassigned_configuration_profile?(params[:id]) ? tree_select : tree_select_unprovisioned_configured_system
    elsif action_name == "tree_select"
      tree_select_unprovisioned_configured_system
    else
      redirect_to :action => "explorer"
    end
  end

  def tree_select_unprovisioned_configured_system
    if unassigned_configuration_profile?(x_node)
      params[:id] = "cs-#{params[:id]}"
      tree_select
    else
      redirect_to :action => "explorer"
    end
  end

  def configuration_manager_providers_tree_rec
    nodes = x_node.split('-')
    case nodes.first
    when "root" then find_record(ManageIQ::Providers::ConfigurationManager, params[:id])
    when "fr"   then find_record(ManageIQ::Providers::Foreman::ConfigurationManager::ConfigurationProfile, params[:id])
    when "cp"   then find_record(ManageIQ::Providers::Foreman::ConfigurationManager::ConfiguredSystem, params[:id])
    when "xx" then
      case nodes.second
      when "fr" then find_record(ManageIQ::Providers::Foreman::ConfigurationManager, params[:id])
      when "csf" then find_record(ConfiguredSystem, params[:id])
      end
    end
  end

  def configuration_manager_cs_filter_tree_rec
    nodes = x_node.split('-')
    case nodes.first
    when "root", "xx" then find_record(ConfiguredSystem, params[:id])
    when "ms"         then find_record(ConfiguredSystem, from_cid(params[:id]))
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
    @showtype     = "main"
    @button_group = case x_active_accord
                    when :configuration_manager_cs_filter
                      rec_cls.to_s
                    when :configuration_manager_providers
                      "provider_foreman_#{rec_cls}"
                    end
  end

  def validate_before_save?
    true
  end

  private

  def textual_group_list
    [%i(properties environment os), %i(tenancy tags)]
  end
  helper_method :textual_group_list

  def provider_class
    ManageIQ::Providers::Foreman::Provider
  end

  def features
    [{:role     => "providers_accord",
      :role_any => true,
      :name     => :configuration_manager_providers,
      :title    => _("Providers")},
     {:role     => "configured_systems_filter_accord",
      :role_any => true,
      :name     => :configuration_manager_cs_filter,
      :title    => _("Configured Systems")},
     ].map do |hsh|
      ApplicationController::Feature.new_with_hash(hsh)
    end
  end

  def build_configuration_manager_tree(type, name)
    tree = case name
           when :configuration_manager_providers_tree
             TreeBuilderConfigurationManager.new(name, type, @sb)
           when :configuration_manager_cs_filter_tree
             TreeBuilderConfigurationManagerConfiguredSystems.new(name, type, @sb)
           end
    instance_variable_set :"@#{name}", tree.tree_nodes
    tree
  end

  def get_node_info(treenodeid, show_list = true)
    @sb[:action] = nil
    @nodetype, id = parse_nodetype_and_id(valid_active_node(treenodeid))
    @show_list = show_list

    model = TreeBuilder.get_model_for_prefix(@nodetype)
    if model == "Hash"
      model = TreeBuilder.get_model_for_prefix(id)
      id = nil
    end

    options = case model
              when "ManageIQ::Providers::Foreman::ConfigurationManager"
                provider_list(id, model)
              when "ConfigurationProfile"
                configuration_profile_node(id, model)
              when "ManageIQ::Providers::Foreman::ConfigurationManager::ConfiguredSystem", "ConfiguredSystem"
                configured_system_list(id, model)
              when "MiqSearch"
                miq_search_node
              else
                if unassigned_configuration_profile?(treenodeid)
                  configuration_profile_node(id, model)
                else
                  default_node
                end
              end
    @right_cell_text += @edit[:adv_search_applied][:text] if x_tree && x_tree[:type] == :configuration_manager_cs_filter && @edit && @edit[:adv_search_applied]

    if @edit && @edit.fetch_path(:adv_search_applied, :qs_exp) # If qs is active, save it in history
      x_history_add_item(:id     => x_node,
                         :qs_exp => @edit[:adv_search_applied][:qs_exp],
                         :text   => @right_cell_text)
    else
      x_history_add_item(:id => treenodeid, :text => @right_cell_text)  # Add to history pulldown array
    end
    if @view && @pages
      {:view => @view, :pages => @pages}
    else
      options
    end
  end

  def provider_node(id, model)
    @record = provider = find_record(ExtManagementSystem, id)
    if provider.nil?
      self.x_node = "root"
      get_node_info("root")
    else
      @no_checkboxes = true
      case @record.type
      when "ManageIQ::Providers::Foreman::ConfigurationManager"
        options = {:model => "ConfigurationProfile", :match_via_descendants => ConfiguredSystem, :where_clause => ["manager_id IN (?)", provider.id]}
        @show_list ? process_show_list(options) : options.merge!(update_options)
        unassigned_profiles = add_unassigned_configuration_profile_record(provider.id)
        options.merge!(unassigned_profiles) unless unassigned_profiles.nil?
        record_model = ui_lookup(:model => self.class.model_to_name(model || TreeBuilder.get_model_for_prefix(@nodetype)))
        @right_cell_text = _("%{model} \"%{name}\"") %
        {:name => provider.name,
         :model => "#{ui_lookup(:tables => "configuration_profile")} under #{record_model} Provider"}
      end
    end
    options
  end

  def configuration_profile_node(id, model)
    @record = @configuration_profile_record = model ? find_record(ConfigurationProfile, id) : ConfigurationProfile.new
    if @configuration_profile_record.nil?
      self.x_node = "root"
      get_node_info("root")
    else
      options = {:model => "ConfiguredSystem", :match_via_descendants => ConfiguredSystem}
      if empty_configuration_profile_record?(@configuration_profile_record)
        options[:where_clause] = ["manager_id IN (?) AND configuration_profile_id IS NULL", id]
      else
        options[:where_clause] = ["configuration_profile_id IN (?)", @configuration_profile_record.id]
      end
      @show_list ? process_show_list(options) : options.merge!(update_options)
      record_model = ui_lookup(:model => model || TreeBuilder.get_model_for_prefix(@nodetype))
      if @sb[:active_tab] == 'configured_systems'
        configuration_profile_right_cell_text(model)
      else
        @showtype        = 'main'
        @pages           = nil
        @right_cell_text = _("%{model} \"%{name}\"") % {:name => @configuration_profile_record.name,
                                                        :model => record_model}
      end
    end
    options
  end

  def default_node
    return unless x_node == "root"
    if x_active_tree == :configuration_manager_providers_tree
      options = {:model => "ManageIQ::Providers::ConfigurationManager"}
      @show_list ? process_show_list(options) : options.merge!(update_options)
      @right_cell_text = _("All Configuration Management Providers")
    elsif x_active_tree == :configuration_manager_cs_filter_tree
      options = {:model => "ManageIQ::Providers::Foreman::ConfigurationManager::ConfiguredSystem"}
      @show_list ? process_show_list(options) : options.merge!(update_options)
      @right_cell_text = _("All Configured Systems")
    end
    options
  end

  def rebuild_trees(replace_trees)
    trees = {}
    if replace_trees
      trees[:configuration_manager_providers] = build_configuration_manager_tree(:configuration_manager_providers,
                                                                                 :configuration_manager_providers_tree) if replace_trees.include?(:configuration_manager_providers)
      trees[:configuration_manager_cs_filter] = build_configuration_manager_tree(:configuration_manager_cs_filter, :configuration_manager_cs_filter_tree) if replace_trees.include?(:configuration_manager_cs_filter)
    end
    trees
  end

  def leaf_record
    get_node_info(x_node)
    @delete_node = params[:id] if @replace_trees
    type, _id = parse_nodetype_and_id(x_node)
    type && %w(ConfiguredSystem).include?(TreeBuilder.get_model_for_prefix(type))
  end

  def configuration_profile_record?(node = x_node)
    type, _id = parse_nodetype_and_id(node)
    type && %w(ConfigurationProfile).include?(TreeBuilder.get_model_for_prefix(type))
  end

  def foreman_provider_record?(node = x_node)
    node = node.split("-").last if node.split("-").first == 'xx'
    type, _id = node.split("-")
    type && ["ManageIQ::Providers::Foreman::ConfigurationManager"].include?(TreeBuilder.get_model_for_prefix(type))
  end

  def provider_record?(node = x_node)
    foreman_provider_record?(node)
  end

  def search_text_type(node)
    return "provider" if provider_record?(node)
    return "configuration_profile" if configuration_profile_record?(node)
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
        if @sb[:action] == "#{controller_name}_add_provider"
          _("Add a new Configuration Management Provider")
        elsif @sb[:action] == "#{controller_name}_edit_provider"
          _("Edit Provider")
        end
      partial = 'form'
      presenter.update(:main_div, r[:partial => partial, :locals => partial_locals])
    elsif valid_configuration_profile_record?(@configuration_profile_record)
      presenter.hide(:form_buttons_div)
      presenter.update(:main_div, r[:partial => "configuration_profile",
                                    :locals  => {:controller => controller_name}])
    else
      presenter.update(:main_div, r[:partial => 'layouts/x_gtl'])
    end
  end

  def group_summary_tab_selected?
    @configuration_profile_record && @sb[:active_tab] == 'summary'
  end

  def active_tab_configured_systems?
    (%w(x_show x_search_by_name).include?(action_name) && configuration_profile_record?) ||
      unassigned_configuration_profile?(x_node)
  end

  def unassigned_configuration_profile?(node)
    _type, _pid, nodeinfo = parse_nodetype_and_id(node)
    nodeinfo == "unassigned"
  end

  def empty_configuration_profile_record?(configuration_profile_record)
    configuration_profile_record.try(:id).nil?
  end

  def valid_configuration_profile_record?(configuration_profile_record)
    configuration_profile_record.try(:id)
  end

  def list_row_id(row)
    if row['name'] == _("Unassigned Profiles Group") && row['id'].nil?
      "-#{row['manager_id']}-unassigned"
    else
      to_cid(row['id'])
    end
  end

  def configuration_profile_right_cell_text(model)
    record_model = ui_lookup(:model => model || TreeBuilder.get_model_for_prefix(@nodetype))
    return if @sb[:active_tab] != 'configured_systems'
    if valid_configuration_profile_record?(@configuration_profile_record)
      @right_cell_text = _("%{model} under %{record_model} \"%{name}\"") %
                         {:model        => ui_lookup(:tables => "configured_system"),
                          :record_model => record_model,
                          :name         => @configuration_profile_record.name}
    else
      @right_cell_text = _("%{model} under Unassigned Profiles Group") %
                         {:model => ui_lookup(:tables => "configured_system")}
    end
  end

  def add_unassigned_configuration_profile_record(provider_id)
    unprovisioned_configured_systems =
      ConfiguredSystem.where(:manager_id => provider_id, :configuration_profile_id => nil).count

    return if unprovisioned_configured_systems == 0

    unassigned_configuration_profile_desc = unassigned_configuration_profile_name = _("Unassigned Profiles Group")
    unassigned_configuration_profile = ConfigurationProfile.new
    unassigned_configuration_profile.manager_id = provider_id
    unassigned_configuration_profile.name = unassigned_configuration_profile_name
    unassigned_configuration_profile.description = unassigned_configuration_profile_desc

    unassigned_profile_row =
      {'x_show_id'                      => "-#{provider_id}-unassigned",
       'description'                    => unassigned_configuration_profile_desc,
       'total_configured_systems'       => unprovisioned_configured_systems,
       'configuration_environment_name' => unassigned_configuration_profile.configuration_environment_name,
       'my_zone'                        => unassigned_configuration_profile.my_zone,
       'region_description'             => unassigned_configuration_profile.region_description,
       'name'                           => unassigned_configuration_profile_name,
       'manager_id'                     => provider_id
      }

    if @view
      add_unassigned_configuration_profile_record_to_view(unassigned_profile_row, unassigned_configuration_profile)
    end
    {
      :unassigned_profile_row           => unassigned_profile_row,
      :unassigned_configuration_profile => unassigned_configuration_profile
    }
  end

  def add_unassigned_configuration_profile_record_to_view(unassigned_profile_row, unassigned_configuration_profile)
    @view.table.data.push(unassigned_profile_row)
    @targets_hash[unassigned_profile_row['id']] = unassigned_configuration_profile
    @grid_hash = view_to_hash(@view)
  end

  def update_options
    options = {}
    options[:dbname] = case x_active_accord
                       when :configuration_manager_providers
                         options[:model] && options[:model] == 'ConfiguredSystem' ? :cm_configured_systems : :cm_providers
                       when :configuration_manager_cs_filter
                         :cm_configured_systems
                       end
    options
  end
  private :update_options

  def process_show_list(options = {})
    options.merge!(update_options)
    super
  end

  menu_section :conf
end
