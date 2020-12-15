class MiqPolicySetController < ApplicationController
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
    @title = _("Policy Profiles")
  end

  def new
    @in_a_form = true
  end

  def edit
    @in_a_form = true
    @_params[:pressed] ||= 'miq_policy_set_edit'
    @_params[:id] ||= find_checked_items[0]
    @profile = params[:id] ? MiqPolicySet.find(params[:id]) : MiqPolicySet.new
  end

  private

  def get_session_data
    @title = _("Policy Profiles")
    @layout = "miq_policy_set"
    @lastaction = session[:miq_policy_set_lastaction]
    @display = session[:miq_policy_set_display]
    @current_page = session[:miq_policy_set_current_page]
  end

  def set_session_data
    super
    session[:layout]                      = @layout
    session[:miq_policy_set_current_page] = @current_page
  end

  def breadcrumbs_options
    {
      :breadcrumbs  => [
        {:title => _("Control")},
        {:title => _('Policy Profiles'), :url => controller_url},
      ].compact,
      :record_title => :description,
    }
  end

  toolbar :miq_policy_set,:miq_policy_sets
  menu_section :con
end
