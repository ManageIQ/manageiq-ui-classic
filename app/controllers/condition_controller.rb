class ConditionController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  UI_FOLDERS = [Host, Vm, ContainerReplicator, ContainerGroup, ContainerNode, ContainerImage, ContainerProject, ExtManagementSystem, PhysicalServer].freeze

  def title
    @title = _("Conditions")
  end

  def index
    flash_to_session
    redirect_to(:action => 'explorer')
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    @refresh_div = "main_div" # Default div for button.rjs to refresh

    unless @refresh_partial # if no button handler ran, show not implemented msg
      add_flash(_("Button not yet implemented"), :error)
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    end
  end

  CONDITION_X_BUTTON_ALLOWED_ACTIONS = {
    'condition_edit'         => :condition_edit,
    'condition_copy'         => :condition_edit,
    'condition_policy_copy'  => :condition_edit,
    'condition_new'          => :condition_edit,
    'condition_remove'       => :condition_remove
  }.freeze

  def x_button
    generic_x_button(CONDITION_X_BUTTON_ALLOWED_ACTIONS)
  end

  def explorer
    @breadcrumbs = []
    @explorer = true
    session[:export_data] = nil

    self.x_active_tree ||= 'condition_tree'
    self.x_active_accord ||= 'condition'

    build_accordions_and_trees
    get_node_info(x_node)

    render :layout => "application"
  end

  # Item clicked on in the explorer right cell
  def x_show
    @explorer = true
    tree_select
  end

  def accordion_select
    self.x_active_accord = params[:id].sub(/_accord$/, '')
    self.x_active_tree   = "#{self.x_active_accord}_tree"
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype)
  end

  def tree_select
    # set these when a link on one of the summary screen was pressed
    self.x_active_accord = params[:accord]           if params[:accord]
    self.x_active_tree   = "#{params[:accord]}_tree" if params[:accord]
    self.x_active_tree   = params[:tree]             if params[:tree]
    self.x_node          = params[:id]

    @sb[:action] = nil
    get_node_info(x_node)
    replace_right_cell(:nodetype => @nodetype)
  end

  def search
    get_node_info(x_node)
    replace_right_cell(:nodetype => "xx")
  end

  def condition_edit
    case params[:button]
    when "cancel"
      id = params[:id] || "new"
      return unless load_edit("condition_edit__#{id}", "replace_cell__explorer")

      @condition = @edit[:condition_id] ? Condition.find(@edit[:condition_id]) : Condition.new
      if @condition.try(:id)
        add_flash(_("Edit of %{model} Condition \"%{name}\" was cancelled by the user") % {:model => ui_lookup(:model => @edit[:new][:towhat]), :name => @condition.description})
      else
        add_flash(_("Add of new %{model} Condition was cancelled by the user") % {:model => ui_lookup(:model => @edit[:new][:towhat])})
      end
      @sb[:action] = @edit = nil
      get_node_info(x_node)
      replace_right_cell(:nodetype => @nodetype, :remove_form_buttons => true)
      return
    when "reset", nil # Reset or first time in
      condition_build_edit_screen
      @sb[:action] = "condition_edit"
      add_flash(_("Ruby scripts are no longer supported in expressions, please change or remove them."), :warning) if @edit[:current][:expression].key?('RUBY')
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "co")
      return
    end

    # Load @edit/vars for other buttons
    id = params[:id] || "new"
    return unless load_edit("condition_edit__#{params[:button] == "add" ? "new" : id}", "replace_cell__explorer")

    @condition = @edit[:condition_id] ? Condition.find(@edit[:condition_id]) : Condition.new

    case params[:button]
    when "save", "add"
      assert_privileges("condition_#{@condition.id ? "edit" : "new"}")
      policy = MiqPolicy.find(@sb[:node_ids][x_active_tree]["p"]) unless x_active_tree == :condition_tree
      adding = @condition.id.blank?
      condition = @condition # Get new or existing record
      condition.description = @edit[:new][:description]
      condition.notes = @edit[:new][:notes]
      condition.towhat = @edit[:new][:towhat] if adding # Set the proper model if adding a record
      exp_remove_tokens(@edit[:new][:expression])
      condition.expression = MiqExpression.new(@edit[:new][:expression])
      exp_remove_tokens(@edit[:new][:applies_to_exp])
      condition.applies_to_exp = @edit[:new][:applies_to_exp]["???"] ? nil : MiqExpression.new(@edit[:new][:applies_to_exp])
      if condition.expression.kind_of?(MiqExpression) &&
        condition.expression.exp["???"]
        add_flash(_("A valid expression must be present"), :error)
      end
      if condition.valid? && !@flash_array && condition.save
        if adding && x_active_tree != :condition_tree # If adding to a policy
          policy.conditions.push(condition)           #   add condition to the policy
          policy.save
        end
        AuditEvent.success(build_saved_audit(condition, @edit))
        if params[:button] == "save"
          add_flash(_("Condition \"%{name}\" was saved") % {:name => @edit[:new][:description]})
        else
          add_flash(_("Condition \"%{name}\" was added") % {:name => @edit[:new][:description]})
        end
        @sb[:action] = @edit = nil
        @nodetype = "co"
        condition_get_info(condition)
        if adding
          case x_active_tree
          when :condition_tree
            @new_condition_node = "xx-#{condition.towhat.camelize(:lower)}_co-#{condition.id}"
            replace_right_cell(:nodetype => "co", :replace_trees => %i[condition], :remove_form_buttons => true)
          when :policy_tree
            node_ids = @sb[:node_ids][x_active_tree]  # Get the selected node ids
            @new_policy_node = "xx-#{policy.mode.downcase}_xx-#{policy.mode.downcase}-#{policy.towhat.downcase}_p-#{node_ids["p"]}_co-#{condition.id}"
            replace_right_cell(:nodetype => "co", :replace_trees => %i[condition], :remove_form_buttons => true)
          when :policy_profile_tree
            node_ids = @sb[:node_ids][x_active_tree]  # Get the selected node ids
            @new_profile_node = "pp-#{node_ids["pp"]}_p-#{node_ids["p"]}_co-#{condition.id}"
            replace_right_cell(:nodetype => "co", :replace_trees => %i[condition], :remove_form_buttons => true)
          end
        else
          replace_right_cell(:nodetype => "co", :replace_trees => %i[condition], :remove_form_buttons => true)
        end
      else
        condition.errors.each do |field, msg|
          add_flash("#{field.to_s.capitalize} #{msg}", :error)
        end
        javascript_flash
      end
    when "expression", "applies_to_exp"
      session[:changed] = (@edit[:new] != @edit[:current])
      @expkey = params[:button].to_sym
      @edit[:expression_table] = exp_build_table_or_nil(@edit[:new][:expression])
      @edit[:scope_table] = exp_build_table_or_nil(@edit[:new][:applies_to_exp])
      replace_right_cell(:nodetype => "co")
    end
  end

  def condition_field_changed
    return unless load_edit("condition_edit__#{params[:id]}", "replace_cell__explorer")

    @condition = @edit[:condition_id] ? Condition.find(@edit[:condition_id]) : Condition.new

    @edit[:new][:description] = params[:description].presence if params[:description]
    @edit[:new][:notes] = params[:notes].presence if params[:notes]

    send_button_changes
  end

  private

  # Get all info for the node about to be displayed
  def get_node_info(treenodeid, show_list = true)
    @show_list = show_list
    _modelname, nodeid, @nodetype = TreeBuilder.extract_node_model_and_id(valid_active_node(treenodeid))
    node_ids = {}
    treenodeid.split("_").each do |p|
      # Create a hash of all record ids represented by the selected tree node
      node_ids[p.split("-").first] = p.split("-").last
    end
    @sb[:node_ids] ||= {}
    @sb[:node_ids][x_active_tree] = node_ids
    condition_get_all_folders if x_node == "root" # Get node info of tree roots
    folder_get_info(treenodeid) if treenodeid != "root" # Get folder info for all node types
    condition_get_info(Condition.find(nodeid)) if @nodetype == "co"
    @show_adv_search = (@nodetype == "xx"   && !@folders) || (@nodetype == "root")
    {:view => @view, :pages => @pages}
  end

  # replace_trees can be an array of tree symbols to be replaced
  def replace_right_cell(options = {})
    nodetype, replace_trees, presenter = options.values_at(:nodetype, :replace_trees, :presenter)
    replace_trees = @replace_trees if @replace_trees # get_node_info might set this
    replace_trees = Array(replace_trees)
    @explorer = true

    trees = build_replaced_trees(replace_trees, %i[condition])

    c_tb = build_toolbar(center_toolbar_filename)

    # Build a presenter to render the JS
    presenter ||= ExplorerPresenter.new(
      :active_tree => x_active_tree,
      :open_accord => params[:accord]
    )

    # Simply replace the tree partials to reload the trees
    replace_trees.each do |name|
      case name
      when :condition
        self.x_node = @new_condition_node if @new_condition_node
      else
        raise _("unknown tree in replace_trees: %{name}") % {name => name}
      end
    end
    reload_trees_by_presenter(presenter, trees)

    presenter[:osf_node] = x_node

    @changed = session[:changed] if @edit # to get save/reset buttons to highlight when fields are moved left/right

    # Replace right side with based on selected tree node type
    case nodetype
    when 'root'
      partial_name, model = ['condition_folders', _('Conditions')]
      presenter.update(:main_div, r[:partial => partial_name])
      right_cell_text = _("All %{models}") % {:models => model}
      right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && %w[alert_profile_tree condition_tree policy_tree].exclude?(x_active_tree.to_s)
    when 'xx'
      presenter.update(
        :main_div,
        if @conditions
          right_cell_text = _("All %{typ} Conditions") % {:typ => ui_lookup(:model => @sb[:folder].try(:camelize))}
          r[:partial => 'condition_list']
        elsif @folders
          mode = @sb[:folder]
          right_cell_text = if mode == 'compliance'
                              _('Compliance Policies')
                            elsif mode == 'control'
                              _('Control Policies')
                            else
                              _("%{typ} Policies") % {:typ => mode.capitalize}
                            end
          r[:partial => 'policy_folders']
        end
      )
      right_cell_text += _(" (Names with \"%{search_text}\")") % {:search_text => @search_text} if @search_text.present? && !@folders
    when 'co'
      # Set the JS types and titles vars if value fields are showing (needed because 2 expression editors are present)
      if @edit && @edit[@expkey]
        %i[val1 val2].each do |val|
          next unless @edit[@expkey][val] # unless an expression with value 1 is showing

          presenter[:exp] = {}
          presenter[:exp]["#{val}_type".to_sym]  = @edit[@expkey][val][:type].to_s if @edit[@expkey][val][:type]
          presenter[:exp]["#{val}_title".to_sym] = @edit[@expkey][val][:title]     if @edit[@expkey][val][:title]
        end
      end
      presenter.update(:main_div, r[:partial => 'condition_details', :locals => {:read_only => true}])
      right_cell_text = if @condition.id.blank?
                          _("Adding a new Condition")
                        elsif @edit
                          _("Editing %{model} Condition \"%{name}\"") %
                            {:name  => @condition.description,
                             :model => ui_lookup(:model => @edit[:new][:towhat])}
                        else
                          _("%{model} Condition \"%{name}\"") %
                            {:name  => @condition.description,
                             :model => ui_lookup(:model => @condition.towhat)}
                        end
    end
    presenter[:right_cell_text] = @right_cell_text = right_cell_text

    presenter.reload_toolbars(:center => c_tb)

    if ((@edit && @edit[:new]) || @assign) && params[:action] != "x_search_by_name"
      locals = {
        :action_url => @sb[:action],
        :record_id  => @edit ? @edit[:rec_id] : @assign[:rec_id],
      }
      presenter.hide(:toolbar)
      # If was hidden for summary screen and there were no records on show_list
      presenter.show(:paging_div, :form_buttons_div)
      presenter.update(:form_buttons_div, r[:partial => "layouts/x_edit_buttons", :locals => locals])
    else
      # Added so buttons can be turned off even tho div is not being displayed it still pops up
      # Abandon changes box when trying to change a node on tree after saving a record
      presenter.hide(:buttons_on).show(:toolbar).hide(:paging_div)
    end

    presenter.hide(:form_buttons_div) if options[:remove_form_buttons]

    replace_search_box(presenter, :nameonly => true)

    # Hide/show searchbox depending on if a list is showing
    presenter.set_visibility(@show_adv_search, :adv_searchbox_div)

    presenter[:record_id] = @record.try(:id)

    presenter[:lock_sidebar] = (@edit || @assign) && params[:action] != "x_search_by_name"

    presenter.update(:breadcrumbs, r[:partial => 'layouts/breadcrumbs'])

    render :json => presenter.for_render
  end

  # Get list of folder contents
  def folder_get_info(folder_node)
    nodetype, nodeid = folder_node.split("_")
    @sb[:mode] = nil
    @sb[:nodeid] = nil
    @sb[:folder] = nodeid.nil? ? nodetype.split("-").last : nodeid
    @conditions = Condition.where(:towhat => @sb[:folder].camelize).sort_by { |c| c.description.downcase }
    set_search_text
    @conditions = apply_search_filter(@search_text, @conditions) if @search_text.present?
    @right_cell_text = _("All %{typ} Conditions") % {:typ => ui_lookup(:model => @sb[:folder].try(:camelize))}
    @right_cell_div = "condition_list"
  end

  def build_expression(parent, model)
    @edit[:new][:expression] = parent.expression.kind_of?(MiqExpression) ? parent.expression.exp : nil
    # Populate exp editor fields for the expression column
    @edit[:expression] ||= ApplicationController::Filter::Expression.new
    @edit[:expression][:expression] = [] # Store exps in an array
    if @edit[:new][:expression].blank?
      @edit[:expression][:expression] = {"???" => "???"}                    # Set as new exp element
      @edit[:new][:expression] = copy_hash(@edit[:expression][:expression]) # Copy to new exp
    else
      @edit[:expression][:expression] = copy_hash(@edit[:new][:expression])
    end
    @edit[:expression_table] = exp_build_table_or_nil(@edit[:expression][:expression])

    @expkey = :expression # Set expression key to expression
    @edit[@expkey].history.reset(@edit[:expression][:expression])
    @edit[:expression][:exp_table] = exp_build_table(@edit[:expression][:expression])
    @edit[:expression][:exp_model] = model
  end

  def condition_build_edit_screen
    @edit = {}
    @edit[:new] = {}
    @edit[:current] = {}

    if params[:copy] # If copying, create a new condition based on the original
      cond = Condition.find(params[:id])
      @condition = cond.dup.tap { |c| c.name = nil }
    else
      @condition = params[:id] && params[:typ] != "new" ? Condition.find(params[:id]) : Condition.new # Get existing or new record
    end
    @edit[:key] = "condition_edit__#{@condition.id || "new"}"
    @edit[:rec_id] = @condition.id || nil

    @edit[:new][:towhat] = if params[:id] && params[:typ] != "new" # If editing existing condition, grab model
                             Condition.find(params[:id]).towhat
                           else
                             x_active_tree == :condition_tree ? @sb[:folder].camelize : MiqPolicy.find(@sb[:node_ids][x_active_tree]["p"]).towhat
                           end

    @edit[:condition_id] = @condition.id
    @edit[:new][:description] = @condition.description
    @edit[:new][:notes] = @condition.notes

    @edit[:new][:expression] = @condition.expression.kind_of?(MiqExpression) ? @condition.expression.exp : nil
    @edit[:new][:applies_to_exp] = @condition.applies_to_exp.kind_of?(MiqExpression) ? @condition.applies_to_exp.exp : nil

    # Populate exp editor fields for the expression column
    @edit[:expression] ||= ApplicationController::Filter::Expression.new
    @edit[:expression][:expression] = [] # Store exps in an array
    if @edit[:new][:expression].blank?
      @edit[:expression][:expression] = {"???" => "???"}                    # Set as new exp element
      @edit[:new][:expression] = copy_hash(@edit[:expression][:expression]) # Copy to new exp
    else
      @edit[:expression][:expression] = copy_hash(@edit[:new][:expression])
    end
    @edit[:expression_table] = exp_build_table_or_nil(@edit[:expression][:expression])

    @expkey = :expression # Set expression key to expression
    @edit[@expkey].history.reset(@edit[:expression][:expression])
    @edit[:expression][:exp_table] = exp_build_table(@edit[:expression][:expression])
    @edit[:expression][:exp_model] = @edit[:new][:towhat] # Set model for the exp editor

    # Populate exp editor fields for the applies_to_exp column
    @edit[:applies_to_exp] ||= ApplicationController::Filter::Expression.new
    @edit[:applies_to_exp][:expression] = [] # Store exps in an array
    if @edit[:new][:applies_to_exp].blank?
      @edit[:applies_to_exp][:expression] = {"???" => "???"}                        # Set as new exp element
      @edit[:new][:applies_to_exp] = copy_hash(@edit[:applies_to_exp][:expression]) # Copy to new exp
    else
      @edit[:applies_to_exp][:expression] = copy_hash(@edit[:new][:applies_to_exp])
    end
    @edit[:scope_table] = exp_build_table_or_nil(@edit[:applies_to_exp][:expression])

    @expkey = :applies_to_exp                                                       # Set temporarily while building applies_to_exp exp editor vars
    @edit[@expkey].history.reset(@edit[:applies_to_exp][:expression])
    @edit[:applies_to_exp][:exp_table] = exp_build_table(@edit[:applies_to_exp][:expression])
    @expkey = :expression                                                           # Reset to default to editing the expression column
    @edit[:applies_to_exp][:exp_model] = @edit[:new][:towhat]                       # Set model for the exp editor

    @edit[:current] = copy_hash(@edit[:new])

    @embedded = true
    @in_a_form = true
    @edit[:current][:add] = true if @edit[:condition_id].nil?                       # Force changed to be true if adding a record
    session[:changed] = (@edit[:new] != @edit[:current])
  end

  def condition_get_all_folders
    @folders = MiqPolicyController::UI_FOLDERS.collect(&:name)
    @right_cell_text = _("All Conditions")
    @right_cell_div = "condition_folders"
  end

  # Get information for a condition
  def condition_get_info(condition)
    @record = @condition = condition
    @right_cell_text = _("Condition \"%{name}\"") % {:name => condition.description}
    @right_cell_div = "condition_details"
    @expression_table = @condition.expression.kind_of?(MiqExpression) ? exp_build_table(@condition.expression.exp) : nil
    @applies_to_exp_table = @condition.applies_to_exp.kind_of?(MiqExpression) ? exp_build_table(@condition.applies_to_exp.exp) : nil
    if x_active_tree == :condition_tree
      @condition_policies = @condition.miq_policies.sort_by { |p| p.description.downcase }
    else
      @condition_policy = MiqPolicy.find(@sb[:node_ids][x_active_tree]["p"])
    end
    add_flash(_("Ruby scripts are no longer supported in expressions, please change or remove them."), :warning) if @condition.expression.exp.key?('RUBY')
  end

  def get_session_data
    @title = _("Conditions")
    @layout = "condition"
    @lastaction = session[:condition_lastaction]
    @display = session[:condition_display]
    @current_page = session[:condition_current_page]
  end

  def set_session_data
    super
    session[:layout]                 = @layout
    session[:condition_current_page] = @current_page
  end

  def features
    [
      {
        :name     => :condition,
        :title    => _("Conditions"),
        :role     => "condition",
        :role_any => true
      },
    ].map { |hsh| ApplicationController::Feature.new_with_hash(hsh) }
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        {:title => _('Explorer')},
      ].compact,
      :record_title => :description,
    }
  end

  menu_section :con
end
