class ConditionController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericFormMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  def title
    @title = _("Conditions")
  end

  # Item clicked
  def show
    assert_privileges("condition_show")
    super
    @condition = @record
    @expression_table = @condition.expression.kind_of?(MiqExpression) ? exp_build_table(@condition.expression.exp) : nil
    @applies_to_exp_table = @condition.applies_to_exp.kind_of?(MiqExpression) ? exp_build_table(@condition.applies_to_exp.exp) : nil
    @condition_policies = @condition.miq_policies.sort_by { |p| p.description.downcase }
    add_flash(_("Ruby scripts are no longer supported in expressions, please change or remove them."), :warning) if @condition.expression.exp.key?('RUBY')
  end

  def new
    condition_edit
  end

  def edit
    condition_edit
  end

  def copy
    condition_edit
  end

  def condition_edit
    case params[:button]
    when "cancel"
      id = params[:id] || "new"
      return unless load_edit("condition_edit__#{id}")

      @condition = @edit[:condition_id] ? Condition.find(@edit[:condition_id]) : Condition.new
      if @condition.try(:id)
        flash_msg = _("Edit of %{model} Condition \"%{name}\" was cancelled by the user") % {:model => ui_lookup(:model => @edit[:new][:towhat]), :name => @condition.description}
      else
        flash_msg = _("Add of new %{model} Condition was cancelled by the user") % {:model => ui_lookup(:model => @edit[:new][:towhat])}
      end
      @edit = session[:edit] = nil # clean out the saved info
      session[:changed] = false
      javascript_redirect(:action => @condition.id ? @lastaction : "show_list", :id => params[:id], :flash_msg => flash_msg)
      return
    when "reset", nil # Reset or first time in
      @_params[:id] ||= find_checked_items[0]
      condition_build_edit_screen
      if flash_errors?
        flash_to_session
        redirect_to(:action => 'show_list')
      else
        add_flash(_("Ruby scripts are no longer supported in expressions, please change or remove them."), :warning) if @edit[:current][:expression] && @edit[:current][:expression].key?('RUBY')
        session[:flash_msgs] = @flash_array
        javascript_redirect(:action        => 'edit',
                            :id            => params[:id],
                            :flash_msg     => _("All changes have been reset"),
                            :flash_warning => true) if params[:button] == "reset"
      end
    else
      # Load @edit/vars for other buttons
      id = params[:id] || "new"
      return unless load_edit("condition_edit__#{params[:button] == "add" ? "new" : id}")

      @condition = @edit[:condition_id] ? Condition.find(@edit[:condition_id]) : Condition.new

      case params[:button]
      when "save", "add"
        assert_privileges("condition_#{@condition.id ? "edit" : "new"}")
        if @edit[:new][:towhat].blank?
          add_flash(_("Applies to is required"), :error)
        end
        adding = @condition.id.blank?
        condition = @condition # Get new or existing record
        condition.description = @edit[:new][:description]
        condition.notes = @edit[:new][:notes]
        condition.towhat = @edit[:new][:towhat] if adding # Set the proper model if adding a record
        exp_remove_tokens(@edit[:new][:expression])
        condition.expression = MiqExpression.new(@edit[:new][:expression])
        exp_remove_tokens(@edit[:new][:applies_to_exp])
        condition.applies_to_exp = @edit[:new][:applies_to_exp]["???"] ? nil : MiqExpression.new(@edit[:new][:applies_to_exp])
        if condition.expression.kind_of?(MiqExpression) && condition.expression.exp["???"]
          add_flash(_("A valid expression must be present"), :error)
        end
        if condition.valid? && !@flash_array && condition.save
          AuditEvent.success(build_saved_audit(condition, @edit))
          if params[:button] == "save"
            flash_msg = _("Condition \"%{name}\" was saved") % {:name => @edit[:new][:description]}
          else
            flash_msg = _("Condition \"%{name}\" was added") % {:name => @edit[:new][:description]}
          end
          @edit = session[:edit] = nil # clean out the saved info
          session[:changed] = @changed = false
          javascript_redirect(:action => params[:button] == "add" ? "show_list" : @lastaction, :id => params[:id], :flash_msg => flash_msg)
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
        @changed = (@edit[:new] != @edit[:current])
        render :update do |page|
          page << javascript_prologue
          page.replace("flash_msg_div", :partial => "layouts/flash_msg")
          page << "miqScrollTop();" if @flash_array.present?
          page.replace_html("form_div", :partial => "form") unless @flash_errors
          page << javascript_for_miq_button_visibility(@changed)
          page << "miqSparkle(false);"
        end
      end
    end
  end

  def condition_field_changed
    return unless load_edit("condition_edit__#{params[:id]}")

    @condition = @edit[:condition_id] ? Condition.find(@edit[:condition_id]) : Condition.new

    @edit[:new][:description] = params[:description].presence if params[:description]
    @edit[:new][:notes] = params[:notes].presence if params[:notes]
    if params[:towhat]
      @edit[:new][:towhat] = params[:towhat]
      build_expression_vars
    end
    send_button_changes
  end

  private

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

    if params[:action] == "copy" # If copying, create a new condition based on the original
      cond = Condition.find(params[:id])
      @condition = cond.dup.tap { |c| c.name = nil }
      @edit[:new][:copy] = true
    else
      @condition = params[:id] && params[:typ] != "new" ? Condition.find(params[:id]) : Condition.new # Get existing or new record
    end

    if @condition.read_only
      add_flash(_("Read only condition can not be edited"), :error)
      return
    end

    @edit[:key] = "condition_edit__#{@condition.id || "new"}"
    @edit[:rec_id] = @condition.id || nil

    @edit[:new][:towhat] = @condition.towhat
    @edit[:condition_id] = @condition.id
    @edit[:new][:description] = @condition.description
    @edit[:new][:notes] = @condition.notes
    build_expression_vars if @edit[:new][:towhat]

    @edit[:current] = copy_hash(@edit[:new])

    @embedded = true
    @in_a_form = true
    @edit[:current][:add] = true if @edit[:condition_id].nil?                       # Force changed to be true if adding a record
    session[:changed] = (@edit[:new] != @edit[:current])
  end

  def build_expression_vars
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

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        {:title => _('Conditions'), :url => controller_url},
      ].compact,
      :record_title => :description,
    }
  end

  toolbar :condition,:conditions
  menu_section :con
end
