class GenericObjectDefinitionController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  include Mixins::ExplorerPresenterMixin

  menu_section :automate

  def self.model
    GenericObjectDefinition
  end

  def show_list
    super
    @right_cell_text = "All #{ui_lookup(:models => self.class.model.name)}"
    self.x_active_tree ||= :generic_object_definitions_tree
    self.x_node ||= 'root'
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

  def x_show
    tree_select
  end

  def custom_button_group_new
    assert_privileges('ab_group_new')
    drop_breadcrumb(:name => _("Add a new Custom Button Group"), :url => "/generic_object_definition/custom_button_group_new")
    @generic_object_definition = GenericObjectDefinition.find(params[:id] || @god_node)
    @in_a_form = true
  end

  def custom_button_group_edit
    assert_privileges('ab_group_edit')
    drop_breadcrumb(:name => _("Edit this Custom Button Group"), :url => "/generic_object_definition/custom_button_group_edit")
    @custom_button_group = CustomButtonSet.find(params[:id])
    render_form
  end

  private

  def root_node?
    params[:id] == 'root'
  end

  def god_node?
    params[:id].split('-').first == 'god'
  end

  def custom_button_group_node?
    params[:id].split('-').first == 'cbg'
  end

  def render_form
    presenter = rendering_objects
    @in_a_form = true
    presenter.replace(:main_div, r[:partial => 'custom_button_group_form'])
    presenter.hide(:paging_div)
    build_toolbar("x_summary_view_tb")

    render :json => presenter.for_render
  end

  def process_root_node(presenter)
    process_show_list
    @right_cell_text = "All #{ui_lookup(:models => self.class.model.name)}"
    presenter.replace(:main_div, r[:partial => 'show_list'])
    presenter.show(:paging_div)
    build_toolbar("x_gtl_view_tb")
  end

  def process_god_node(presenter)
    @_params[:id] = params[:id].split("-").last
    show
    @right_cell_text = @record.name
    presenter.replace(:main_div, r[:partial => 'show'])
    presenter.hide(:paging_div)
    build_toolbar("x_summary_view_tb")
  end

  def process_custom_button_group_node(presenter)
    @record = CustomButtonSet.find(from_cid(params[:id].split("-").last))
    @right_cell_text = @record.name
    presenter.replace(:main_div, r[:partial => 'show_custom_button_group'])
    presenter.hide(:paging_div)
    build_toolbar("x_summary_view_tb")
  end

  def replace_right_cell
    presenter = rendering_objects
    @explorer = false

    v_tb = process_root_node(presenter) if root_node?
    v_tb = process_god_node(presenter) if god_node?
    v_tb = process_custom_button_group_node(presenter) if custom_button_group_node?

    c_tb = build_toolbar(center_toolbar_filename)
    presenter.reload_toolbars(:center => c_tb, :view => v_tb)

    presenter.set_visibility(c_tb.present? || v_tb.present?, :toolbar)
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
