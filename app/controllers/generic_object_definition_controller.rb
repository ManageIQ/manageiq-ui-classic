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

  private

  def replace_right_cell
    @explorer = false
    if params[:id] == 'root'
      process_show_list
      @right_cell_text = "All #{ui_lookup(:models => self.class.model.name)}"
    else
      @_params[:id] = params[:id].split("-").last
      show
      @right_cell_text = @record.name
    end
    presenter = ExplorerPresenter.new(:active_tree => x_active_tree)

    presenter[:osf_node] = x_node
    c_tb = build_toolbar(center_toolbar_filename) # Use vm or template tb
    if params[:id] == 'root'
      presenter.replace(:main_div, r[:partial => 'show_list'])
      presenter.show(:paging_div)
      v_tb = build_toolbar("x_gtl_view_tb")
    else
      presenter.replace(:main_div, r[:partial => 'show'])
      presenter.hide(:paging_div)
      v_tb = build_toolbar("x_summary_view_tb")
    end
    # Hide/show searchbox depending on if a list is showing
    presenter.set_visibility(!(@record || @in_a_form), :searchbox)

    presenter.reload_toolbars(:center => c_tb, :view => v_tb)

    presenter.set_visibility(c_tb.present? || v_tb.present?, :toolbar)

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
