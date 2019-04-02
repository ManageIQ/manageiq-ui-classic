class GenericObjectDefinitionController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  menu_section :automate

  def self.model
    GenericObjectDefinition
  end

  def index
    self.x_node = 'root'
    redirect_to(:action => "show_list")
  end

  def show_list
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
    @tree = TreeBuilderGenericObjectDefinition.new(:generic_object_definitions_tree, :generic_object_definitions, @sb)
  end

  def button
    if @display == 'generic_objects' && params[:pressed] == 'generic_object_tag'
      tag(GenericObject)
      return
    end
    button_actions
  end

  def button_actions
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
    render_form(title, 'custom_button_group_form')
  end

  def custom_button_group_edit
    assert_privileges('ab_group_edit')
    @custom_button_group = CustomButtonSet.find(params[:id])
    title = _("Edit Custom Button Group '%{name}'") % {:name => @custom_button_group.name}
    render_form(title, 'custom_button_group_form')
  end

  def custom_button_new
    assert_privileges('ab_button_new')
    title = _("Add a new Custom Button")
    if node_type(x_node || params[:id]) == :button_group
      @custom_button_group = CustomButtonSet.find(params[:id])
      @generic_object_definition = GenericObjectDefinition.find(@custom_button_group.set_data[:applies_to_id])
    else
      @generic_object_definition = GenericObjectDefinition.find(params[:id])
    end
    render_form(title, 'custom_button_form')
  end

  def custom_button_edit
    assert_privileges('ab_button_edit')
    @custom_button = CustomButton.find(params[:id])
    title = _("Edit Custom Button '%{name}'") % {:name => @custom_button.name}
    render_form(title, 'custom_button_form')
  end

  def retrieve_distinct_instances_across_domains
    distinct_instances_across_domains =
      MiqAeClass.find_distinct_instances_across_domains(User.current_user, "SYSTEM/PROCESS").pluck(:name).sort.each do |instance|
        {:name => instance}
      end
    render :json => {:distinct_instances_across_domains => distinct_instances_across_domains}
  end

  def add_button_in_group
    custom_button_set = CustomButtonSet.find(params[:id])
    custom_button_set.set_data[:button_order] ||= []
    custom_button_set.set_data[:button_order].push(CustomButton.last.id)
    custom_button_set.save!
  end

  private

  def node_type(node)
    node_prefix = node.split('-').first
    case node_prefix
    when 'root' then :root
    when 'god'  then :god
    when 'cbg'  then :button_group
    when 'xx'   then :actions
    when 'cb'   then :button
    else        raise 'Invalid node type.'
    end
  end

  def node_info(node)
    case node_type(node)
    when :root         then root_node_info
    when :god          then god_node_info(node)
    when :actions      then actions_node_info(node)
    when :button_group then custom_button_group_node_info(node)
    when :button       then custom_button_node_info(node)
    end
  end

  def root_node_info
    @root_node = true
    @center_toolbar = 'generic_object_definitions'
    @right_cell_text = _("All %{models}") % {:models => _("Generic Object Classes")}
  end

  def god_node_info(node)
    @god_node = true
    @center_toolbar = 'generic_object_definition'
    @record = GenericObjectDefinition.find(node.split('-').last)
    @right_cell_text = _("Generic Object Class %{record_name}") % {:record_name => @record.name}
    @gtl_type = nil
  end

  def actions_node_info(node)
    @actions_node = true
    @center_toolbar = 'generic_object_definition_actions_node'
    @record = GenericObjectDefinition.find(node.split('-').last)
    @right_cell_text = _("Actions for %{model}") % {:model => _("Generic Object Class")}
    @gtl_type = nil
  end

  def custom_button_group_node_info(node)
    @custom_button_group_node = true
    @center_toolbar = 'generic_object_definition_button_group'
    @record = CustomButtonSet.find(node.split("-").last)
    @right_cell_text = _("Custom Button Set %{record_name}") % {:record_name => @record.name}
    @gtl_type = nil
  end

  def custom_button_node_info(node)
    @custom_button_node = true
    @center_toolbar = 'generic_object_definition_button'
    @record = CustomButton.find(node.split("-").last)
    @right_cell_text = _("Custom Button %{record_name}") % {:record_name => @record.name}
    @gtl_type = nil
  end

  def render_form(title, form_partial)
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    @in_a_form = true
    presenter[:right_cell_text] = title
    presenter.replace(:main_div, r[:partial => form_partial])
    presenter.hide(:paging_div)
    presenter[:lock_sidebar] = true
    presenter.set_visibility(false, :toolbar)

    render :json => presenter.for_render
  end

  def process_root_node(presenter)
    root_node_info
    process_show_list
    presenter.replace(:main_div, r[:partial => 'list'])
    presenter.show(:paging_div)
    [build_toolbar("gtl_view_tb"), build_toolbar("generic_object_definitions_center_tb")]
  end

  def process_god_node(presenter, node)
    god_node_info(node)
    presenter.replace(:main_div, r[:partial => 'show_god'])
    presenter.hide(:paging_div)
    [build_toolbar("x_summary_view_tb"), build_toolbar("generic_object_definition_center_tb")]
  end

  def process_actions_node(presenter, node)
    actions_node_info(node)
    presenter.replace(:main_div, r[:partial => 'show_actions'])
    presenter.hide(:paging_div)
    [build_toolbar("x_summary_view_tb"), build_toolbar("generic_object_definition_actions_node_center_tb")]
  end

  def process_custom_button_group_node(presenter, node)
    custom_button_group_node_info(node)
    presenter.replace(:main_div, r[:partial => 'show_custom_button_group'])
    presenter.hide(:paging_div)
    [build_toolbar("x_summary_view_tb"), build_toolbar("generic_object_definition_button_group_center_tb")]
  end

  def process_custom_button_node(presenter, node)
    custom_button_node_info(node)
    presenter.replace(:main_div, r[:partial => 'show_custom_button'])
    presenter.hide(:paging_div)
    [build_toolbar("x_summary_view_tb"), build_toolbar("generic_object_definition_button_center_tb")]
  end

  def replace_right_cell
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)
    @explorer = false

    node = x_node || params[:id]

    v_tb, c_tb = case node_type(node)
                 when :root         then process_root_node(presenter)
                 when :god          then process_god_node(presenter, node)
                 when :actions      then process_actions_node(presenter, node)
                 when :button_group then process_custom_button_group_node(presenter, node)
                 when :button       then process_custom_button_node(presenter, node)
                 end

    h_tb = build_toolbar("x_history_tb")

    presenter.reload_toolbars(:history => h_tb, :center => c_tb, :view => v_tb)
    presenter.set_visibility(true, :toolbar)
    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs_new'])

    presenter[:osf_node] = x_node
    presenter[:record_id] = @record.try(:id)
    presenter[:right_cell_text] = @right_cell_text

    render :json => presenter.for_render
  end

  def textual_group_list
    [%i(properties relationships attribute_details_list association_details_list method_details_list)]
  end

  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Automation")},
        {:title => _("Automate")},
        {:title => _("Generic Objects")},
      ],
      :record_info => @generic_object_definition,
    }
  end

  def build_breadcrumbs_from_tree
    breadcrumbs = []
    tree = build_tree if @tree.nil?
    if x_node && tree
      breadcrumbs = current_tree_path(JSON.parse(tree.bs_tree).first, x_node)
    end
    breadcrumbs
  end
end
