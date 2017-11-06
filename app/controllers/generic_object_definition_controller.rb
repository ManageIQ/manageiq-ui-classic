class GenericObjectDefinitionController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  menu_section :automate

  def self.model
    GenericObjectDefinition
  end

  def show_list
    build_tree
    super
    self.x_active_tree ||= :generic_object_definitions_tree
    self.x_node ||= 'root'
    node_info
  end

  def show
    build_tree
    super
    self.x_node = "god-#{to_cid(params[:id])}"
    @breadcrumbs = []
  end

  def build_tree
    @tree = TreeBuilderGenericObjectDefinition.new(:generic_object_definitions_tree, :generic_object_definitions_tree, @sb)
  end

  def button
    if @display == 'generic_objects' && params[:pressed] == 'generic_object_tag'
      tag(GenericObject)
      return
    end
    javascript_redirect(
      case params[:pressed]
      when 'generic_object_definition_new'
        { :action => 'new' }
      when 'generic_object_definition_edit'
        { :action => 'edit', :id => from_cid(params[:id] || params[:miq_grid_checks]) }
      when 'ab_group_new'
        { :action => 'custom_button_group_new', :id => from_cid(params[:id] || params[:miq_grid_checks]) }
      when 'ab_group_edit'
        { :action => 'custom_button_group_edit', :id => from_cid(params[:id]) }
      end
    )
  end

  def new
    assert_privileges('generic_object_definition_new')
    drop_breadcrumb(:name => _("Add a new Generic Object Class"), :url => "/generic_object_definition/new")
    @in_a_form = true
  end

  def edit
    assert_privileges('generic_object_definition_edit')
    drop_breadcrumb(:name => _("Edit Generic Object Class"), :url => "/generic_object_definition/edit/#{params[:id]}")
    @generic_object_definition = GenericObjectDefinition.find(params[:id])
    @in_a_form = true
  end

  def self.display_methods
    %w(generic_objects)
  end

  def default_show_template
    "generic_object_definition/show"
  end

  def display_tree
    true
  end

  def custom_button_group_new
    assert_privileges('ab_group_new')
    title = _("Add a new Custom Button Group")
    @generic_object_definition = GenericObjectDefinition.find(params[:id])
    render_form(title)
  end

  def custom_button_group_edit
    assert_privileges('ab_group_edit')
    @custom_button_group = CustomButtonSet.find(params[:id])
    title = _("Edit Custom Button Group '#{@custom_button_group.name}'")
    render_form(title)
  end

  private

  def root_node?(node)
    node == 'root'
  end

  def god_node?(node)
    node.split('-').first == 'god'
  end

  def custom_button_group_node?(node)
    node.split('-').first == 'cbg'
  end

  def actions_node?(node)
    node.split('-').first == 'xx'
  end

  def retrieve_node_type(node)
    return 'root' if node == 'root'
    node.split('-').first
  end

  def node_info
    node = x_node || params[:id]

    root_node_info if root_node?(node)
    god_node_info(node) if god_node?(node)
    actions_node_info(node) if actions_node?(node)
    custom_button_group_node_info(node) if custom_button_group_node?(node)
  end

  def root_node_info
    @root_node = true
    @right_cell_text = _("All %{models}") % {:models => _("Generic Object Classes")}
  end

  def god_node_info(node)
    @god_node = true
    @record = GenericObjectDefinition.find(from_cid(node.split('-').last))
    @right_cell_text = _("Generic Object Class %{record_name}") % {:record_name => @record.name}
  end

  def actions_node_info(node)
    @actions_node = true
    @record = GenericObjectDefinition.find(from_cid(node.split('-').last))
    @right_cell_text = _("Actions for %{model}") % {:model => _("Generic Object Class")}
  end

  def custom_button_group_node_info(node)
    @custom_button_group_node = true
    @record = CustomButtonSet.find(from_cid(node.split("-").last))
    @right_cell_text = _("Custom Button Set %{record_name}") % {:record_name => @record.name}
  end

  def render_form(title)
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)
    @in_a_form = true
    presenter[:right_cell_text] = title
    presenter.replace(:main_div, r[:partial => 'custom_button_group_form'])
    presenter.hide(:paging_div)
    presenter[:lock_sidebar] = true
    build_toolbar("x_summary_view_tb")

    render :json => presenter.for_render
  end

  def process_root_node(presenter)
    root_node_info
    process_show_list
    presenter.replace(:main_div, r[:partial => 'list'])
    presenter.show(:paging_div)
    build_toolbar("x_gtl_view_tb")
  end

  def process_god_node(presenter, node)
    god_node_info(node)
    presenter.replace(:main_div, r[:partial => 'show_god'])
    presenter.hide(:paging_div)
    build_toolbar("x_summary_view_tb")
  end

  def process_actions_node(presenter, node)
    actions_node_info(node)
    presenter.replace(:main_div, r[:partial => 'show_actions'])
    presenter.hide(:paging_div)
    build_toolbar("x_summary_view_tb")
  end

  def process_custom_button_group_node(presenter, node)
    custom_button_group_node_info(node)
    presenter.replace(:main_div, r[:partial => 'show_custom_button_group'])
    presenter.hide(:paging_div)
    build_toolbar("x_summary_view_tb")
  end

  def replace_right_cell
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)
    @explorer = false

    node = x_node || params[:id]

    v_tb = process_root_node(presenter) if root_node?(node)
    v_tb = process_god_node(presenter, node) if god_node?(node)
    v_tb = process_custom_button_group_node(presenter, node) if custom_button_group_node?(node)
    v_tb = process_actions_node(presenter, node) if actions_node?(node)

    c_tb = build_toolbar(center_toolbar_filename)
    h_tb = build_toolbar("x_history_tb")

    presenter.reload_toolbars(:history => h_tb, :center => c_tb, :view => v_tb)
    presenter.set_visibility(h_tb.present? || c_tb.present? || v_tb.present?, :toolbar)
    presenter.set_visibility(!(@record || @in_a_form), :searchbox)

    presenter[:osf_node] = x_node
    presenter[:record_id] = @record.try(:id)
    presenter[:activate_node] = x_active_tree.to_s
    presenter[:right_cell_text] = @right_cell_text

    render :json => presenter.for_render
  end

  def textual_group_list
    [%i(properties relationships attribute_details_list association_details_list method_details_list)]
  end

  helper_method :textual_group_list
end
