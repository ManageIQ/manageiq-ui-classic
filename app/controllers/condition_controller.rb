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

  def show_searchbar?
    true
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
    assert_privileges("condition_new")
    @in_a_form = true
  end

  def edit
    assert_privileges("condition_edit")
    @record = Condition.find(params.expect(:id))
    if @record.read_only
      flash_to_session(_("Read only condition cannot be edited"), :error)
      redirect_to(:action => 'show_list') and return
    end
    @in_a_form = true
  end

  def copy
    assert_privileges("condition_copy")
    @record = Condition.find(params.expect(:id))
    if @record.read_only
      flash_to_session(_("Read only condition cannot be edited"), :error)
      redirect_to(:action => 'show_list') and return
    end
    @in_a_form = true
  end

  # POST /condition/expression_preview
  def expression_preview
    payload = JSON.parse(request.body.read)
    expression = payload['expression']
    text = ''

    if expression.present?
      exp_remove_tokens(expression)
      text = exp_build_table(expression).map { |token| [token].flatten.first.to_s }.join(' ')
    end

    render :json => {:text => text}
  rescue JSON::ParserError => e
    render :json => {:success => false, :message => e.message}, :status => 400
  rescue => e
    render :json => {:text => '', :error => e.message}
  end

  private

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

  feature_for_actions %w[condition_edit condition_new], :expression_preview

  toolbar :condition, :conditions
  menu_section :con
end
