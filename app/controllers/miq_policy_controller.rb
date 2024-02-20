class MiqPolicyController < ApplicationController
  include Events
  include Policies

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericFormMixin
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericToolbarMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PolicyMixin

  def title
    @title = _("Policies")
  end

  def show_searchbar?
    true
  end

  def index
    flash_to_session
    redirect_to(:action => 'show_list')
  end

  def new
    drop_breadcrumb(:name => _("Add New %{table}") % {:table => ui_lookup(:table => table_name)},:url  => "/#{controller_name}/new")
    miq_policy_edit
  end

  def edit
    @_params[:id] ||= find_checked_items[0]
    miq_policy_edit
    if params[:id]
      @policy = MiqPolicy.find(params[:id])
      drop_breadcrumb(:name => _("Edit %{object_type} '%{object_name}'") % {:object_type => ui_lookup(:tables => table_name), :object_name => @policy.description},:url  => "/#{controller_name}/#{@policy.id}/edit")
    end
  end

  private

  def build_expression_table(expression)
    expression.kind_of?(MiqExpression) ? exp_build_table(expression.exp) : nil
  end
  helper_method :build_expression_table

  def get_session_data
    @title = _("Policies")
    @layout = "miq_policy"
    @lastaction = session[:miq_policy_lastaction]
    @display = session[:miq_policy_display]
    @current_page = session[:miq_policy_current_page]
  end

  def set_session_data
    super
    session[:layout]                  = @layout
    session[:miq_policy_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        menu_breadcrumb,
      ].compact,
      :record_info  => @policy || @record,
      :record_title => :description,
    }
  end

  def menu_breadcrumb
    {:title => _("Policies"), :url => controller_url}
  end

  toolbar :miq_policy, :miq_policies
  menu_section :con
end
