class GenericObjectDefinitionController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  menu_section :automate
  feature_for_actions %w[
    generic_object_definition_show_list
    generic_object_definition_ab_group_new
    generic_object_definition_ab_group_edit
    generic_object_definition_ab_button_new
    generic_object_definition_ab_button_edit
  ], *EXP_EDITOR_ACTIONS

  def self.model
    GenericObjectDefinition
  end

  def index
    self.x_node = 'root'
    redirect_to(:action => "show_list")
  end

  def show_list
    self.x_node = params[:id] if params[:id].present?
    self.x_active_tree ||= :generic_object_definitions_tree
    self.x_node ||= 'root'
    build_tree
    process_show_list
    node_info(x_node)
  end

  def show
    self.x_node = "god-#{params[:id]}"
    if params[:display] || @display
      super
    else
      @breadcrumbs = []
      redirect_to(:action => "show_list")
    end
  end

  def build_tree
    @tree = TreeBuilderGenericObjectDefinition.new(:generic_object_definitions_tree, @sb)
  end

  def button
    if @display == 'generic_objects' && params[:pressed] == 'generic_object_tag'
      tag(GenericObject)
      return
    end
    button_actions
  end

  def button_actions
    @button_acton = params[:pressed]
    javascript_redirect(
      case params[:pressed]
      when 'generic_object_definition_new'
        {:action => 'new'}
      when 'generic_object_definition_edit'
        {:action => 'edit', :id => params[:id] || params[:miq_grid_checks]}
      when 'ab_group_new'
        {:action => 'custom_button_group_new', :id => params[:id] || params[:miq_grid_checks]}
      when 'ab_group_edit'
        {:action => 'custom_button_group_edit', :id => params[:id]}
      when 'ab_button_new'
        {:action => 'custom_button_new', :id => params[:id] || params[:miq_grid_checks]}
      when 'ab_button_edit'
        {:action => 'custom_button_edit', :id => params[:id]}
      end
    )
  end

  def new
    assert_privileges('generic_object_definition_new')
    @right_cell_text = _("Add a new Generic Object Definition")
    @in_a_form = true
  end

  def edit
    assert_privileges('generic_object_definition_edit')
    @generic_object_definition = GenericObjectDefinition.find(params[:id])
    @right_cell_text = _("Edit a Generic Object Definition '%{name}'") % {:name => @generic_object_definition.name}
    @in_a_form = true
  end

  def self.display_methods
    %w[generic_objects]
  end

  def default_show_template
    "generic_object_definition/show"
  end

  def display_tree
    true
  end

  def custom_button_group_new
    assert_privileges('generic_object_definition_ab_group_new')
    @right_cell_text = _("Add a new Custom Button Group")
    @generic_object_definition = GenericObjectDefinition.find(params[:id])
    render_form(@right_cell_text, 'custom_button_group_form')
  end

  def custom_button_group_edit
    assert_privileges('generic_object_definition_ab_group_edit')
    @custom_button_group = CustomButtonSet.find(params[:id])
    @right_cell_text = _("Edit Custom Button Group '%{name}'") % {:name => @custom_button_group.name}
    @generic_object_definition = find_record_with_rbac(GenericObjectDefinition, @custom_button_group.set_data[:applies_to_id])
    render_form(@right_cell_text, 'custom_button_group_form')
  end

  def custom_button_new
    assert_privileges('generic_object_definition_ab_button_new')
    @right_cell_text = _("Add a new Custom Button")
    @distinct_instances_across_domains = MiqAeClass.find_distinct_instances_across_domains(User.current_user, "SYSTEM/PROCESS").pluck(:name).sort
    @templates = ServiceTemplateAnsiblePlaybook.order(:name).map { |item| {:name => item.name, :id => item.id} } || []
    if node_type(x_node || params[:id]) == :button_group
      @custom_button_group = CustomButtonSet.find(params[:id])
      @generic_object_definition = GenericObjectDefinition.find(@custom_button_group.set_data[:applies_to_id])
    else
      @generic_object_definition = GenericObjectDefinition.find(params[:id])
    end
    render_form(@right_cell_text, 'custom_button_form')
  end

  def custom_button_edit
    assert_privileges('generic_object_definition_ab_button_edit')
    @custom_button = CustomButton.find(params[:id])
    @right_cell_text = _("Edit Custom Button '%{name}'") % {:name => @custom_button.name}
    @distinct_instances_across_domains = MiqAeClass.find_distinct_instances_across_domains(User.current_user, "SYSTEM/PROCESS").pluck(:name).sort
    @templates = ServiceTemplateAnsiblePlaybook.order(:name).map { |item| {:name => item.name, :id => item.id} } || []
    render_form(@right_cell_text, 'custom_button_form')
  end

  def retrieve_distinct_instances_across_domains
    assert_privileges('generic_object_definition_ab_button_new', 'generic_object_definition_ab_button_edit')
    distinct_instances_across_domains = MiqAeClass.find_distinct_instances_across_domains(User.current_user, "SYSTEM/PROCESS").pluck(:name).sort
    render :json => {:distinct_instances_across_domains => distinct_instances_across_domains}
  end

  def service_template_ansible_playbooks
    templates = ServiceTemplateAnsiblePlaybook.order(:name).map { |item| {:name => item.name, :id => item.id} } || []
    render :json => {:templates => templates}
  end

  def add_button_in_group
    assert_privileges('generic_object_definition_ab_button_edit')
    custom_button_set = CustomButtonSet.find(params[:id])
    custom_button_set.set_data[:button_order] ||= []
    custom_button_set.set_data[:button_order].push(CustomButton.last.id)
    custom_button_set.save!
  end

  def custom_buttons_in_set
    assert_privileges(params[:custom_button_set_id].present? ? 'generic_object_definition_ab_group_edit' : 'generic_object_definition_ab_group_new')
    assigned_buttons = if params[:custom_button_set_id].present?
                         button_set = find_record_with_rbac(CustomButtonSet, params[:custom_button_set_id])
                         button_set.custom_buttons
                       else
                         []
                       end
    generic_object_definition = find_record_with_rbac(GenericObjectDefinition, params[:generic_object_definition_id])
    unassigned_buttons = generic_object_definition.custom_buttons
    assigned_buttons = assigned_buttons.map { |button| {:name => button.name, :id => button.id} }
    unassigned_buttons = unassigned_buttons.map { |button| {:name => button.name, :id => button.id} }
    render :json => {:assigned_buttons => assigned_buttons, :unassigned_buttons => unassigned_buttons}
  end

  private

  def node_type(node)
    node_prefix = node.split('-').first
    case node_prefix
    when 'root' then :root
    when 'god'  then :god
    when 'cbg'  then :button_group
    when 'cb'   then :button
    else        raise 'Invalid node type.'
    end
  end

  def node_info(node)
    case node_type(node)
    when :root         then root_node_info
    when :god          then god_node_info(node)
    when :button_group then custom_button_group_node_info(node)
    when :button       then custom_button_node_info(node)
    end
  end

  def root_node_info
    @root_node = true
    @center_toolbar = 'generic_object_definitions'
    @right_cell_text = _("All %{models}") % {:models => _("Generic Object Definitions")}
  end

  def god_node_info(node)
    @god_node = true
    @center_toolbar = 'generic_object_definition'
    @record = GenericObjectDefinition.find(node.split('-').last)
    @right_cell_text = _("Generic Object Definition %{record_name}") % {:record_name => @record.name}
  end

  def custom_button_group_node_info(node)
    @custom_button_group_node = true
    @center_toolbar = 'generic_object_definition_button_group'
    @record = CustomButtonSet.find(node.split("-").last)
    @right_cell_text = _("Custom Button Set %{record_name}") % {:record_name => @record.name}
  end

  def custom_button_node_info(node)
    @custom_button_node = true
    @center_toolbar = 'generic_object_definition_button'
    @record = CustomButton.find(node.split("-").last)
    @right_cell_text = _("Custom Button %{record_name}") % {:record_name => @record.name}
  end

  def render_form(title, form_partial)
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    @in_a_form = true
    presenter[:right_cell_text] = title
    presenter.update(:main_div, r[:partial => form_partial])
    presenter.hide(:paging_div)
    presenter.hide(:searchbox)
    presenter[:lock_sidebar] = true
    presenter.set_visibility(false, :toolbar)
    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => presenter.for_render
  end

  def process_root_node(presenter)
    root_node_info
    process_show_list
    presenter.update(:main_div, r[:partial => 'list'])
    presenter.show(:paging_div)
    [build_toolbar("download_view_tb"), build_toolbar("generic_object_definitions_center_tb")]
  end

  def process_god_node(presenter, node)
    god_node_info(node)
    presenter.update(:main_div, r[:partial => 'show_god'])
    presenter.hide(:paging_div)
    presenter.hide(:searchbox)
    [build_toolbar("x_summary_view_tb"), build_toolbar("generic_object_definition_center_tb")]
  end

  def process_custom_button_group_node(presenter, node)
    custom_button_group_node_info(node)
    presenter.update(:main_div, r[:partial => 'show_custom_button_group'])
    presenter.hide(:paging_div)
    presenter.hide(:searchbox)
    [build_toolbar("x_summary_view_tb"), build_toolbar("generic_object_definition_button_group_center_tb")]
  end

  def process_custom_button_node(presenter, node)
    custom_button_node_info(node)
    presenter.update(:main_div, r[:partial => 'show_custom_button'])
    presenter.hide(:paging_div)
    presenter.hide(:searchbox)
    [build_toolbar("x_summary_view_tb"), build_toolbar("generic_object_definition_button_center_tb")]
  end

  def replace_right_cell
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)
    @explorer = false

    node = x_node || params[:id]
    @node_type = node.split('-').first

    v_tb, c_tb = case node_type(node)
                 when :root         then process_root_node(presenter)
                 when :god          then process_god_node(presenter, node)
                 when :button_group then process_custom_button_group_node(presenter, node)
                 when :button       then process_custom_button_node(presenter, node)
                 end

    presenter.reload_toolbars(:center => c_tb, :view => v_tb)
    presenter.set_visibility(true, :toolbar)
    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    presenter[:osf_node] = x_node
    presenter[:record_id] = @record.try(:id)
    presenter[:right_cell_text] = @right_cell_text

    render :json => presenter.for_render
  end

  def textual_group_list
    [%i[properties relationships attribute_details_list association_details_list method_details_list]]
  end

  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Automation")},
        {:title => _("Automate")},
        {:title => _("Generic Objects"), :url => url_for_only_path(:controller => 'generic_object_definition',
                                                                   :action => 'show_list',
                                                                   :id => 'root')},
      ],
      :record_info  => @generic_object_definition,
      :disable_tree => %w[new edit].include?(action_name),
      :to_explorer  => 'show_list',
    }
  end

  def features
    [
      {
        :role  => "generic_object_definition",
        :name  => :generic_object_definitions,
        :title => _("Generic Object Definitions"),
      },
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def action_breadcrumb?
    @right_cell_text && params[:action] != "tree_select"
  end
end
